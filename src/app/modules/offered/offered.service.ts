import { StatusCodes } from "http-status-codes";
import { IJwtPayload } from "../auth/auth.interface";
import { Offered } from "./offered.model";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../../errors/AppError";
import { Shop } from "../shop/shop.model";
import { ICreateOfferedInput } from "./offered.interface";


const createOffered = async (offerProductsData: ICreateOfferedInput, user: IJwtPayload) => {
  const shopIsActive = await Shop.findOne({
    owner: user.id,
    isActive: true
  }).select("isActive");

  if (!shopIsActive) throw new AppError(StatusCodes.BAD_REQUEST, "Shop is not active!");

  const { products, discountPercentage } = offerProductsData;
  const createdBy = user.id;

  const operations = products.map((product) => ({
    updateOne: {
      filter: { product },
      update: {
        $setOnInsert: {
          product,
          discountPercentage,
          createdBy,
        },
      },
      upsert: true,
    },
  }));

  const result = await Offered.bulkWrite(operations);
  return result;
};

const getActiveOfferedService = async (query: Record<string, unknown>) => {
  const { minPrice, maxPrice, ...pQuery } = query;

  const offeredQuery = new QueryBuilder(
    Offered.find()
      .populate('product', 'name')
      .populate('product.categoryId', 'name')
      .populate('product.shopId', 'name')
      .populate('product.brandId', 'name'),
    query
  )
    .paginate();

  const offered = await offeredQuery.modelQuery.lean();

  const offeredMap = offered.reduce((acc, offered) => {
    //@ts-ignore
    acc[offered.product._id.toString()] = offered.discountPercentage;
    return acc;
  }, {});

  const productsWithOfferPrice = offered.map((offered: any) => {
    const product = offered.product;
    //@ts-ignore
    const discountPercentage = offeredMap[product._id.toString()];

    if (discountPercentage) {
      const discount = (discountPercentage / 100) * product.price;
      product.offerPrice = product.price - discount;
    } else {
      product.offerPrice = null;
    }

    return product;
  });

  const meta = await offeredQuery.countTotal();

  return {
    meta,
    result: productsWithOfferPrice,
  };
};



export const OfferedService = {
  createOffered,
  getActiveOfferedService
}