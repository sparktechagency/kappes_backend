import { StatusCodes } from "http-status-codes";
import { IJwtPayload } from "../auth/auth.interface";
import { Offered } from "./offered.model";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../../errors/AppError";
import { Shop } from "../shop/shop.model";
import { ICreateOfferedInput } from "./offered.interface";
import { USER_ROLES } from "../user/user.enums";
import { Product } from "../product/product.model";

const createOffered = async (offerProductsData: ICreateOfferedInput, user: IJwtPayload) => {
  const isExistsProducts = await Product.find({
    _id: { $in: offerProductsData.products },
  }).populate('shopId', 'owner admins').select("shopId");

  if (isExistsProducts.length !== offerProductsData.products.length) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Some products not found ${offerProductsData.products.join(", ")} in db`
    );
  }

  const isProductOwner = isExistsProducts.every(
    (product: any) => product.shopId.owner.toString() === user.id.toString()
  );

  const isProductAdmin = isExistsProducts.every(
    (product: any) => product.shopId.admins?.some((admin: any) => admin.toString() === user.id.toString())
  );

  if (!isProductOwner && !isProductAdmin) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      `You have no permission to create offered for this product`
    );
  }
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
      .populate('product', 'name basePrice'),
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
      const discount = (discountPercentage / 100) * product.basePrice;
      product.offerPrice = product.basePrice - discount;
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

const getAllOffered = async (query: Record<string, unknown>) => {
  const offeredQuery = new QueryBuilder(
    Offered.find().populate('product', 'name basePrice'),
    query
  )
    .paginate()
    .filter()
    .sort();

  const offered = await offeredQuery.modelQuery.lean();

  const meta = await offeredQuery.countTotal();

  return {
    meta,
    result: offered,
  };
};




export const OfferedService = {
  createOffered,
  getAllOffered,
  getActiveOfferedService
}