
import { Shop } from "./shop.model";
import { IJwtPayload } from "../auth/auth.interface";
import { User } from "../user/user.model";
import mongoose from "mongoose";
import { IShop } from "./shop.interface";
import AppError from "../../../errors/AppError";
import QueryBuilder from "../../builder/QueryBuilder";

const createShop = async (payload: IShop, user: IJwtPayload) => {
    const { name, email } = payload;

    // Check if shop with the same name or email already exists
    const existingShop = await Shop.findOne({ $or: [{ name } { email }] });
    if (existingShop) {
        throw new AppError(400, 'Shop with this name or email already exists');
    }

    // Create a new shop
    const newShop = new Shop({
        ...payload,
        owner: user.id,
    });

    const createdShop = await newShop.save();
    return createdShop;
}
const getAllShops = async (query: Record<string, unknown>) => {
    const shopQuery = new QueryBuilder(Shop.find(), query)
        .search(['name', 'email'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await shopQuery.modelQuery;
    const meta = await shopQuery.countTotal();

    return {
        meta,
        result,
    };
}
const getShopById = async (id: string) => {
    const shop = await Shop.findById(id).populate('reviews').populate('owner', 'name email');
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    return shop;
}
const updateShopById = async (id: string, payload: Partial<IShop>) => {
    const shop = await Shop.findByIdAndUpdate(id, payload, { new: true })
        .populate('reviews')
        .populate('owner', 'name email');
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    return shop;
}
const deleteShopById = async (id: string) => {
    const shop = await Shop.findByIdAndDelete(id);
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    return shop;
}
const getShopsByOwner = async (ownerId: string) => {
    const shops = await Shop.find({ owner: ownerId }).populate('reviews').populate('owner', 'name email');
    if (!shops || shops.length === 0) {
        throw new AppError(404, 'No shops found for this owner');
    }
    return shops;
}
const getShopsByLocation = async (query: Record<string, unknown>) => {
    const shopQuery = new QueryBuilder(Shop.find(), query)
        .search(['address.province', 'address.city', 'address.territory'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await shopQuery.modelQuery;
    const meta = await shopQuery.countTotal();

    return {
        meta,
        result,
    };
}
const getShopsByType = async (type: string) => {
    const shops = await Shop.find({ type })
        .populate('reviews')
        .populate('owner', 'name email');
    if (!shops || shops.length === 0) {
        throw new AppError(404, 'No shops found for this type');
    }
    return shops;
}
    ,
const getChatsByShop = async (shopId: string) => {
    const shop = await Shop.findById(shopId).populate('chats');
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    return shop.chats;
}
const getOrdersByShop = async (shopId: string) => {
    const shop = await Shop.findById(shopId).populate('orders');
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    return shop.orders;
}
const getCouponsByShop = async (shopId: string) => {
    const shop = await Shop.findById(shopId).populate('coupons');
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    return shop.coupons;
}
const getAdminsByShop = async (shopId: string) => {
    const shop = await Shop.findById(shopId).populate('admins', 'name email');
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    return shop.admins;
}
const getFollowersByShop = async (shopId: string) => {
    const shop = await Shop.findById(shopId).populate('followers', 'name email');
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    return shop.followers;
}
const addAdminToShop = async (shopId: string, adminId: string) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    if (shop.admins.includes(adminId)) {
        throw new AppError(400, 'Admin already exists in this shop');
    }
    shop.admins.push(adminId);
    await shop.save();
    return shop;
}
const removeAdminFromShop = async (shopId: string, adminId: string) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    if (!shop.admins.includes(adminId)) {
        throw new AppError(400, 'Admin does not exist in this shop');
    }
    shop.admins = shop.admins.filter((id) => id.toString() !== adminId);
    await shop.save();
    return shop;
}
const toggleFollowUnfollowShop = async (shopId: string, userId: string) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    if (shop.followers.includes(userId)) {
        shop.followers = shop.followers.filter((id) => id.toString() !== userId);
    } else {
        shop.followers.push(userId);
    }
    await shop.save();
    return shop;
}
const getShopByEmail = async (email: string) => {
    const shop = await Shop.find(
        { email }
        { name: 1, email: 1, description: 1, logo: 1, cover_photo: 1 }
    ).populate('reviews').populate('owner', 'name email'
    );
    if (!shop) {
        throw new AppError(404, 'Shop not found with this email');
    }
    return shop;
}
const getShopByName = async (name: string) => {
    const shop = await Shop.find(
        { name }
        { name: 1, email: 1, description: 1, logo: 1, cover_photo: 1 }
    ).populate('reviews').populate('owner', 'name email');
    if (!shop) {
        throw new AppError(404, 'Shop not found with this name');
    }
    return shop;
}
const getShopByPhone = async (phone: string) => {
    const shop = await Shop.find()
        .where('phone')
        .equals(phone)
        .select('name email description logo cover_photo')
        .populate('reviews')
        .populate('owner', 'name email');

    if (!shop) {
        throw new AppError(404, 'Shop not found with this phone number');
    }
    return shop;
}
    ,
const getShopByOwnerId = async (ownerId: string) => {
    const shop = await Shop.findOne({ owner: ownerId })
        .populate('reviews')
        .populate('owner', 'name email');
    if (!shop) {
        throw new AppError(404, 'Shop not found for this owner');
    }
    return shop;
}

// getShopsByShopCategory
const getShopsByShopCategory = async (category: string) => {
    const shops = await Shop.find({ categories: category })
        .populate('reviews')
        .populate('owner', 'name email');
    if (!shops || shops.length === 0) {
        throw new AppError(404, 'No shops found for this category');
    }
    return shops;
}

// Export the ShopService

export const ShopService = {
    createShop,
    getAllShops,
    getShopById,
    updateShopById,
    deleteShopById,
    getShopsByOwner,
    getShopsByLocation,
    getShopsByType,
    getChatsByShop,
    getOrdersByShop,
    getCouponsByShop,
    getAdminsByShop,
    getFollowersByShop,
    addAdminToShop,
    removeAdminFromShop,
    toggleFollowUnfollowShop,
    getShopByEmail,
    getShopByName,
    getShopByPhone,
    getShopByOwnerId,
    getShopsByShopCategory
}
