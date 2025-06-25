import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { ICoupon } from './coupon.interface';
import { Coupon } from './coupon.model';
import { IJwtPayload } from '../auth/auth.interface';
import AppError from '../../../errors/AppError';
import { Shop } from '../shop/shop.model';
import { USER_ROLES } from '../user/user.enums';
import { calculateDiscount } from './coupon.utils';

const createCoupon = async (couponData: Partial<ICoupon>, user: IJwtPayload) => {
    const shop = await Shop.findById(couponData.shopId);
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
    }

    if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
        if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this product');
        }
    }

    const coupon = new Coupon({
        ...couponData,
        shop: shop._id,
        createdBy: user.id,
    });
    return await coupon.save();
};

const getAllCoupon = async (query: Record<string, unknown>) => {
    const brandQuery = new QueryBuilder(Coupon.find(), query)
        .search(['code'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await brandQuery.modelQuery;
    const meta = await brandQuery.countTotal();

    return {
        meta,
        result,
    };
};

const updateCoupon = async (payload: Partial<ICoupon>, couponCode: string, user: IJwtPayload) => {
    console.log({ payload, couponCode });

    const currentDate = new Date();

    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found.');
    }

    if (coupon.endDate < currentDate) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon has expired.');
    }
    const shop = await Shop.findById(coupon.shopId);
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
    }

    if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
        if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this product');
        }
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
        coupon._id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updatedCoupon;
};

const getCouponByCode = async (orderAmount: number, couponCode: string, shopId: string) => {
    const currentDate = new Date();

    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found.');
    }

    if (!coupon.isActive) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon is inactive.');
    }

    if (coupon.endDate < currentDate) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon has expired.');
    }

    if (coupon.startDate > currentDate) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon has not started.');
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Below Minimum order amount');
    }

    if (!(shopId === coupon.shopId.toString())) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Coupon is not applicable on your selected products!');
    }

    const discountAmount = calculateDiscount(coupon, orderAmount);

    const discountedPrice = orderAmount - discountAmount;

    return { coupon, discountedPrice, discountAmount };
};

const deleteCoupon = async (couponId: string, user: IJwtPayload) => {
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Coupon not found.');
    }

    const shop = await Shop.findById(coupon.shopId);
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
    }

    if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
        if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this product');
        }
    }

    await Coupon.updateOne({ _id: coupon._id }, { isDeleted: true });

    return { message: 'Coupon deleted successfully.' };
};

const getAllCouponByShopId = async (shopId: string, user: IJwtPayload) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
    }

    if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
        if (shop.owner.toString() !== user.id && !shop.admins?.some(admin => admin.toString() === user.id)) {
            throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this product');
        }
    }

    const coupon = await Coupon.find({ shopId });

    return coupon;
};

export const CouponService = {
    createCoupon,
    getAllCoupon,
    updateCoupon,
    getCouponByCode,
    deleteCoupon,
    getAllCouponByShopId,
};
