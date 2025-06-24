
import { Shop } from "./shop.model";
import { IJwtPayload } from "../auth/auth.interface";
import { User } from "../user/user.model";
import mongoose from "mongoose";
import { IShop } from "./shop.interface";
import AppError from "../../../errors/AppError";
import QueryBuilder from "../../builder/QueryBuilder";
import { USER_ROLES } from "../user/user.enums";
import { StatusCodes } from "http-status-codes";
import unlinkFile from "../../../shared/unlinkFile";

const createShop = async (payload: IShop, user: IJwtPayload) => {
    const { name, email } = payload;

    // Check if shop with the same name or email already exists
    const existingShop = await Shop.findOne({ $or: [{ name }, { email }] });
    if (existingShop) {
        throw new AppError(400, 'Shop with this name or email already exists');
    }

    const existingUser = await User.findById(user.id);
    if (!existingUser) {
        throw new AppError(404, 'User not found');
    }

    if (existingUser.role !== USER_ROLES.VENDOR) {
        // update role to vendor
        existingUser.role = USER_ROLES.VENDOR;

        await existingUser.save();
    }

    // check if user has already a shop
    // const existingShopByUser = await Shop.findOne({ owner: user.id });
    // if (existingShopByUser) {
    //     throw new AppError(400, 'User already has a shop');
    // }


    // Create a new shop
    const newShop = new Shop({
        ...payload,
        owner: user.id,
    });

    const createdShop = await newShop.save();
    return createdShop;
}

const makeShopAdmin = async (shopId: string, tobeAdminId: string, user: IJwtPayload) => {
    const shop = await Shop.findById(new mongoose.Types.ObjectId(shopId));
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    if (shop.owner.toString() !== user.id) {
        throw new AppError(400, 'You are not the owner of this shop, you can not make admin');
    }

    const isExistUser = await User.findById(new mongoose.Types.ObjectId(tobeAdminId));
    if (!isExistUser) {
        throw new AppError(404, 'User not found');
    }
    if (shop.owner.toString() === tobeAdminId) {
        throw new AppError(400, 'The owner of the shop can not be made as admin');
    }

    if (shop.admins?.includes(new mongoose.Types.ObjectId(tobeAdminId))) {
        throw new AppError(400, 'User is already an admin of the shop');
    }
    shop.admins?.push(new mongoose.Types.ObjectId(tobeAdminId));
    await shop.save();
    return shop;
}

const getAllShops = async (query: Record<string, unknown>) => {
    const shopQuery = new QueryBuilder(Shop.find().populate('owner', 'full_name email').populate('admins', 'full_name email').populate('followers', 'full_name email'), query)
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
    const shop = await Shop.findById(id).populate('owner', 'name email').populate('admins', 'name email').populate('followers', 'name email');
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
    }
    return shop;
}
const updateShopById = async (id: string, payload: Partial<IShop>, user: IJwtPayload) => {
    const shop = await Shop.findById(id);
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
    }
    if (user.role === USER_ROLES.VENDOR) {
        if (shop.owner.toString() !== user.id) {
            throw new AppError(StatusCodes.FORBIDDEN, 'Forbidden: You are not authorized to update this shop');
        }
    }
    console.log({ payload })
    const updatedShop = await Shop.findByIdAndUpdate(id, payload, { new: true });
    if (!updatedShop) {
        if (payload.logo) {
            unlinkFile(payload.logo);
        }
        if (payload.banner) {
            unlinkFile(payload.banner);
        }
        if (payload.coverPhoto) {
            unlinkFile(payload.coverPhoto);
        }
        throw new AppError(StatusCodes.OK, 'Failed to update shop');
    }

    if (shop.logo) {
        unlinkFile(shop.logo);
    }
    if (shop.banner) {
        unlinkFile(shop.banner);
    }
    if (shop.coverPhoto) {
        unlinkFile(shop.coverPhoto);
    }

    return updatedShop;
}
const deleteShopById = async (id: string) => {
    const shop = await Shop.findByIdAndDelete(id);
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
    }
    return shop;
}
const getShopsByOwner = async (ownerId: string) => {
    const shops = await Shop.find({ owner: ownerId }).populate('reviews').populate('owner', 'name email');
    if (!shops || shops.length === 0) {
        throw new AppError(StatusCodes.NOT_FOUND, 'No shops found for this owner');
    }
    return shops;
}
const getShopsByLocation = async (query: Record<string, unknown>) => {
    const shopQuery = new QueryBuilder(Shop.find().populate('owner', 'full_name email'), query)
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
        .populate('owner', 'full_name email');
    if (!shops || shops.length === 0) {
        throw new AppError(StatusCodes.NOT_FOUND, 'No shops found for this type');
    }
    return shops;
}
const getChatsByShop = async (shopId: string) => {
    const shop = await Shop.findById(shopId).populate('chats');
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
    }
    return shop.chats;
}
const getOrdersByShop = async (shopId: string) => {
    const shop = await Shop.findById(shopId).populate('orders');
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
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
    const shop = await Shop.findById(shopId).populate('admins', 'full_name email');
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    return shop.admins;
}
const getFollowersByShop = async (shopId: string) => {
    const shop = await Shop.findById(shopId).populate('followers', 'full_name email');
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    return shop.followers;
}
// const addAdminToShop = async (shopId: string, adminId: string) => {
//     const shop = await Shop.findById(shopId);
//     if (!shop) {
//         throw new AppError(404, 'Shop not found');
//     }
//     if (shop.admins.includes(adminId)) {
//         throw new AppError(400, 'Admin already exists in this shop');
//     }
//     shop.admins.push(adminId);
//     await shop.save();
//     return shop;
// }
// const removeAdminFromShop = async (shopId: string, adminId: string) => {
//     const shop = await Shop.findById(shopId);
//     if (!shop) {
//         throw new AppError(404, 'Shop not found');
//     }
//     if (!shop.admins.includes(adminId)) {
//         throw new AppError(400, 'Admin does not exist in this shop');
//     }
//     shop.admins = shop.admins.filter((id) => id.toString() !== adminId);
//     await shop.save();
//     return shop;
// }
const toggleFollowUnfollowShop = async (shopId: string, userId: string) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new AppError(404, 'Shop not found');
    }
    if (!shop.followers) {
        shop.followers = [];
    }
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    const index = shop.followers.findIndex(id => id.toString() === userIdObjectId.toString());
    if (index > -1) {
        shop.followers.splice(index, 1);
    } else {
        shop.followers.push(userIdObjectId);
    }
    await shop.save();
    return shop;
}
// const getShopByEmail = async (email: string) => {
//     const shop = await Shop.find(
//         { email }
//         { name: 1, email: 1, description: 1, logo: 1, coverPhoto: 1 }
//     ).populate('reviews').populate('owner', 'name email'
//     );
//     if (!shop) {
//         throw new AppError(404, 'Shop not found with this email');
//     }
//     return shop;
// }
// const getShopByName = async (name: string) => {
//     const shop = await Shop.find(
//         { name }
//         { name: 1, email: 1, description: 1, logo: 1, coverPhoto: 1 }
//     ).populate('reviews').populate('owner', 'name email');
//     if (!shop) {
//         throw new AppError(404, 'Shop not found with this name');
//     }
//     return shop;
// }
const getShopByPhone = async (phone: string) => {
    const shop = await Shop.find()
        .where('phone')
        .equals(phone)
        .select('name email description logo coverPhoto')
        .populate('reviews')
        .populate('owner', 'name email');

    if (!shop) {
        throw new AppError(404, 'Shop not found with this phone number');
    }
    return shop;
}
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
    makeShopAdmin,
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
    // addAdminToShop,
    // removeAdminFromShop,
    toggleFollowUnfollowShop,
    // getShopByEmail,
    // getShopByName,
    getShopByPhone,
    getShopByOwnerId,
    getShopsByShopCategory
}
