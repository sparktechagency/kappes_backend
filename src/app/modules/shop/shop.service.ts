import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import { IJwtPayload } from '../auth/auth.interface';
import { Order } from '../order/order.model';
import { Product } from '../product/product.model';
import { stripeAccountService } from '../stripeAccount/stripeAccount.service';
import { USER_ROLES } from '../user/user.enums';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import { IShop } from './shop.interface';
import { Shop } from './shop.model';

const createShop = async (payload: IShop, user: IJwtPayload, host: string, protocol: string) => {
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
     const existingShopByUser = await Shop.findOne({ owner: new mongoose.Types.ObjectId(user.id) });
     if (existingShopByUser) {
          throw new AppError(400, 'User already has a shop');
     }

     // Create a new shop
     const newShop = new Shop({
          ...payload,
          owner: new mongoose.Types.ObjectId(user.id),
     });

     const createdShop = await newShop.save();
     const stripe_account_onboarding_url = await stripeAccountService.createConnectedStripeAccount(user, host, protocol);
     return { stripe_account_onboarding_url, createdShop };
};

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
};

const getAllShops = async (query: Record<string, unknown>) => {
     const shopQuery = new QueryBuilder(Shop.find().populate('owner', 'full_name email').populate('admins', 'full_name email').populate('followers', 'full_name email'), query)
          .search(['name', 'email', 'address.province', 'address.city', 'address.territory'])
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
};
const getShopById = async (id: string) => {
     const shop = await Shop.findById(id).populate('owner', 'name email').populate('admins', 'name email').populate('followers', 'name email');
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
     }
     return shop;
};
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
     console.log({ payload });
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
};
const deleteShopById = async (id: string, user: IJwtPayload) => {
     const shop = await Shop.findById(id);
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
     }

     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to delete this shop');
          }
     }
     // make isDeleted true
     shop.isDeleted = true;
     await shop.save();
     return shop;
};
const getShopsMyShops = async (ownerId: string) => {
     const shopIsActive = await Shop.findOne({
          owner: new mongoose.Types.ObjectId(ownerId),
          isActive: true,
     }).select('isActive name email');
     return shopIsActive;
};

// const getShopsByLocation = async (location: {
//     coordinates: [number, number];
// }) => {
//     if (
//         !location.coordinates ||
//         !Array.isArray(location.coordinates) ||
//         location.coordinates.length !== 2
//     ) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid coordinates');
//     }
//     console.log(location.coordinates)
//     const result = await Shop.find({
//         'location.coordinates': { $ne: [0, 0] },
//         location: {
//             $near: {
//                 $geometry: {
//                     type: 'Point',
//                     coordinates: location.coordinates,
//                 },
//                 $maxDistance: 5000, // 5 km radius
//             },
//         },
//     });
//     return result;
// }

const getShopsByLocation = async (location: { coordinates: [number, number] }) => {
     if (!location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid coordinates');
     }

     try {
          // Get the native MongoDB collection
          const collection = Shop.collection;

          // Use the native aggregate method
          const result = await collection
               .aggregate([
                    {
                         $geoNear: {
                              near: {
                                   type: 'Point',
                                   coordinates: location.coordinates,
                              },
                              distanceField: 'distance',
                              maxDistance: 5000,
                              spherical: true,
                              query: {
                                   'location.coordinates': { $ne: [0, 0] },
                                   'isDeleted': { $ne: true },
                              },
                         },
                    },
               ])
               .toArray();

          return result;
     } catch (error) {
          console.error('Error in getShopsByLocation:', error);
          throw error;
     }
};

const getShopsByType = async (type: string) => {
     const shops = await Shop.find({ type }).populate('reviews').populate('owner', 'full_name email');
     if (!shops || shops.length === 0) {
          throw new AppError(StatusCodes.NOT_FOUND, 'No shops found for this type');
     }
     return shops;
};
const getChatsByShop = async (shopId: string) => {
     const shop = await Shop.findById(shopId).populate('chats');
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
     }
     return shop.chats;
};
const getOrdersByShop = async (shopId: string) => {
     const shop = await Shop.findById(shopId).populate('orders');
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found');
     }
     return shop.orders;
};
const getCouponsByShop = async (shopId: string) => {
     const shop = await Shop.findById(shopId).populate('coupons');
     if (!shop) {
          throw new AppError(404, 'Shop not found');
     }
     return shop.coupons;
};
const getAdminsByShop = async (shopId: string) => {
     const shop = await Shop.findById(shopId).populate('admins', 'full_name email');
     if (!shop) {
          throw new AppError(404, 'Shop not found');
     }
     return shop.admins;
};
const getFollowersByShop = async (shopId: string) => {
     const shop = await Shop.findById(shopId).populate('followers', 'full_name email');
     if (!shop) {
          throw new AppError(404, 'Shop not found');
     }
     return { totalFollowers: shop.totalFollowers || shop.followers?.length || 0, followers: shop.followers };
};
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
     const index = shop.followers.findIndex((id) => id.toString() === userIdObjectId.toString());
     if (index > -1) {
          shop.followers.splice(index, 1);
     } else {
          shop.followers.push(userIdObjectId);
     }
     await shop.save();
     return shop;
};
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
     const shop = await Shop.find().where('phone').equals(phone).select('name email description logo coverPhoto').populate('reviews').populate('owner', 'name email');

     if (!shop) {
          throw new AppError(404, 'Shop not found with this phone number');
     }
     return shop;
};
const getShopByOwnerId = async (ownerId: string) => {
     const shop = await Shop.findOne({ owner: ownerId }).populate('reviews').populate('owner', 'name email');
     if (!shop) {
          throw new AppError(404, 'Shop not found for this owner');
     }
     return shop;
};

// getShopsByShopCategory
const getShopsByShopCategory = async (category: string) => {
     const shops = await Shop.find({ categories: category }).populate('reviews').populate('owner', 'name email');
     if (!shops || shops.length === 0) {
          throw new AppError(404, 'No shops found for this category');
     }
     return shops;
};

const getShopsByOwnerOrAdmin = async (user: IJwtPayload) => {
     const asOwnerShops = await Shop.find({ owner: user.id }).populate('owner', 'name email');
     const asAdminShops = await Shop.find({ admins: user.id }).populate('owner', 'name email');
     const shops = {
          meta: {
               asOwnerShopsCount: asOwnerShops.length,
               asAdminShopsCount: asAdminShops.length,
          },
          asOwnerShops,
          asAdminShops,
     };
     if (!shops || (shops.asOwnerShops.length === 0 && shops.asAdminShops.length === 0)) {
          throw new AppError(404, 'No shops found for this owner or admin');
     }
     return shops;
};

const isShopExist = async (shopId: string) => {
     const result: any = await Shop.findOne({
          _id: new mongoose.Types.ObjectId(shopId),
     }).populate({
          path: 'owner',
          select: '_id stripeCustomerId stripeConnectedAccount',
     });

     return result;
};

const getProductsByShopId = async (shopId: string, query: Record<string, unknown>) => {
     const productQuery = new QueryBuilder(Product.find({ shopId }).populate('shopId', 'name email owner'), query).search(['name', 'description', 'tags']).filter().sort().paginate().fields();

     const products = await productQuery.modelQuery;
     const meta = await productQuery.countTotal();

     if (!products || products.length === 0) {
          throw new AppError(404, 'No products found for this shop');
     }

     return {
          meta,
          products,
     };
};

const getShopAdminsByShopId = async (shopId: string, query: Record<string, unknown>, user: IJwtPayload) => {
     const shopQuery = new QueryBuilder(
          Shop.find({ _id: shopId }).populate('admins', 'full_name createdAt email').populate('owner', 'full_name createdAt email').select('admins owner name email phone address'),
          query,
     )
          .search(['name', 'description', 'tags'])
          .filter()
          .sort()
          .paginate()
          .fields();

     const shops = await shopQuery.modelQuery;
     const meta = await shopQuery.countTotal();

     if (!shops || shops.length === 0) {
          throw new AppError(404, 'No shops found for this shop');
     }

     return {
          meta,
          shops,
     };
};

const createShopAdmin = async (payload: Partial<IUser>, shopId: string, user: IJwtPayload) => {
     // use mongoose transaction
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          // check if user exists with the payload.email
          const userExists = await User.findOne({ email: payload.email }).session(session);
          if (userExists) {
               throw new AppError(400, `User already exists so use "/make-shop-admin/:shopId" api`);
          }

          // create user
          payload.role = USER_ROLES.SHOP_ADMIN;
          payload.verified = true;
          const [newUser] = await User.create([payload], { session });
          if (!newUser) {
               throw new AppError(400, 'User not created');
          }

          // check if shop exists
          const shop = await Shop.findById(new mongoose.Types.ObjectId(shopId)).session(session);
          if (!shop) {
               throw new AppError(404, 'Shop not found');
          }

          // check authorization
          if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
               if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
                    throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to create a shop admin for this shop');
               }
          }

          // add new user to shop admins
          shop.admins?.push(newUser._id);
          await shop.save({ session });

          // Commit the transaction
          await session.commitTransaction();
          session.endSession();

          // send welcome email
          const values = {
               name: newUser.full_name,
               email: newUser.email!,
               password: payload.password!,
          };
          const createAccountTemplate = emailTemplate.createAdminAccount(values);
          await emailHelper.sendEmail(createAccountTemplate);
          return newUser;
     } catch (error) {
          console.log('🚀 ~ createShopAdmin ~ error:', error);
          // Abort the transaction on error
          await session.abortTransaction();
          session.endSession();

          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create shop admin');
     }
};

// const createShopAdmin = async (payload: Partial<IUser>, shopId: string, user: IJwtPayload) => {
//      const session = await mongoose.startSession();
//      await session.withTransaction(async () => {
//           // check if user exists with the payload.email
//           const userExists = await User.findOne({ email: payload.email }).session(session);
//           if (userExists) {
//                throw new AppError(400, `User already exists so use "/make-shop-admin/:shopId" api`);
//           }
//           // create user
//           payload.role = USER_ROLES.SHOP_ADMIN;
//           payload.verified = true;
//           const newUser = await User.create([payload], { session });
//           if (!newUser) {
//                throw new AppError(400, 'User not created');
//           }
//           const shop = await Shop.findById(new mongoose.Types.ObjectId(shopId)).session(session);
//           if (!shop) {
//                throw new AppError(404, 'Shop not found');
//           }

//           if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
//                if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
//                     throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to create a shop admin for this shop');
//                }
//           }
//           shop.admins?.push(newUser[0]._id);
//           await shop.save({ session });

//           const values = {
//                name: newUser[0].full_name,
//                email: newUser[0].email!,
//                password: payload.password!,
//           };
//           const createAccountTemplate = emailTemplate.createAdminAccount(values);
//           await emailHelper.sendEmail(createAccountTemplate);

//           return newUser[0];
//      });
// };

const getShopOverview = async (shopId: string, user: IJwtPayload) => {
     const shop = await Shop.findById(shopId).populate('owner', 'name email').populate('admins', 'name email').populate('followers', 'name email');

     if (!shop) {
          throw new AppError(404, 'Shop not found');
     }

     // get total orders
     const totalOrders = await Order.countDocuments({ shop: shopId });

     // get total earnings
     const totalEarnings = await Order.aggregate([
          {
               $match: {
                    shop: new mongoose.Types.ObjectId(shopId),
               },
          },
          {
               $group: {
                    _id: null,
                    totalEarnings: { $sum: '$finalAmount' },
               },
          },
     ]);

     // get year based orders
     const yearOrders = await Order.aggregate([
          {
               $match: {
                    shop: new mongoose.Types.ObjectId(shopId),
               },
          },
          {
               $group: {
                    _id: { $year: '$createdAt' },
                    orders: { $sum: 1 },
               },
          },
          {
               $sort: {
                    _id: -1,
               },
          },
     ]);

     // get year based earnings
     const yearEarnings = await Order.aggregate([
          {
               $match: {
                    shop: new mongoose.Types.ObjectId(shopId),
               },
          },
          {
               $group: {
                    _id: { $year: '$createdAt' },
                    earnings: { $sum: '$finalAmount' },
               },
          },
          {
               $sort: {
                    _id: -1,
               },
          },
     ]);

     // get month based earnings and orders
     const monthEarnings = await Order.aggregate([
          {
               $match: {
                    shop: new mongoose.Types.ObjectId(shopId),
               },
          },
          {
               $group: {
                    _id: {
                         year: { $year: '$createdAt' },
                         month: { $month: '$createdAt' },
                    },
                    earnings: { $sum: '$finalAmount' },
                    orders: { $sum: 1 },
               },
          },
          {
               $sort: {
                    '_id.year': -1,
                    '_id.month': -1,
               },
          },
     ]);

     return {
          ...shop.toObject(),
          totalOrders,
          totalEarnings: totalEarnings?.[0]?.totalEarnings || 0,
          yearOrders,
          yearEarnings,
          monthEarnings,
     };
};

const getShopsByFollower = async (followerId: string) => {
     console.log(followerId);
     const shopQuery = new QueryBuilder(Shop.find({ followers: { $in: [followerId] } }).populate('owner', 'full_name email'), {})
          .search(['name', 'description', 'tags'])
          .filter()
          .sort()
          .paginate()
          .fields();

     const shops = await shopQuery.modelQuery;
     const meta = await shopQuery.countTotal();

     if (!shops || shops.length === 0) {
          throw new AppError(404, 'No shops found for this follower');
     }

     return {
          meta,
          shops,
     };
};

/**getShopsProvincesListWithProductCount
 * get all the shops
 * make a count products using each shopId
 * make a array of objects [{province: 'Dhaka',productCount: 10}]
 *
 */

const getShopsProvincesListWithProductCount = async (query: Record<string, unknown>) => {
     const pipeline = [
          {
               // Optional: Filter the shops based on the provided query (if necessary)
               $match: query,
          },
          {
               // Lookup products based on the shopId field in the products collection
               $lookup: {
                    from: 'products', // Join with the 'products' collection
                    localField: '_id', // The _id of the shop
                    foreignField: 'shopId', // The field that holds the shopId in the products collection
                    as: 'products', // This will add a new field "products" with matched items
               },
          },
          {
               // Add the count of products for each shop
               $addFields: {
                    productCount: { $size: { $ifNull: ['$products', []] } }, // Count the number of products
               },
          },
          {
               // Group by province and sum the product count
               $group: {
                    _id: '$address.province', // Group by province (from address field)
                    totalProducts: { $sum: '$productCount' }, // Sum the product counts for each province
               },
          },
          {
               // Project the result in the desired format [{ province: 'Dhaka', productCount: 10 }]
               $project: {
                    province: '$_id', // Rename _id to province
                    productCount: '$totalProducts', // Rename totalProducts to productCount
                    _id: 0, // Remove _id field
               },
          },
     ];

     try {
          const result = await Shop.aggregate(pipeline).exec(); // Use Mongoose's aggregate method
          return result; // Returns an array of { province: 'Dhaka', productCount: 10 }
     } catch (error) {
          console.error('Error fetching provinces with product counts:', error);
          throw error; // Throws the error if aggregation fails
     }
};

const getShopsTerritoryListWithProductCount = async (query: Record<string, unknown>) => {
     const pipeline = [
          {
               // Optional: Filter the shops based on the provided query (if necessary)
               $match: query,
          },
          {
               // Lookup products based on the shopId field in the products collection
               $lookup: {
                    from: 'products', // Join with the 'products' collection
                    localField: '_id', // The _id of the shop
                    foreignField: 'shopId', // The field that holds the shopId in the products collection
                    as: 'products', // This will add a new field "products" with matched items
               },
          },
          {
               // Add the count of products for each shop
               $addFields: {
                    productCount: { $size: { $ifNull: ['$products', []] } }, // Count the number of products
               },
          },
          {
               // Group by province and sum the product count
               $group: {
                    _id: '$address.territory', // Group by province (from address field)
                    totalProducts: { $sum: '$productCount' }, // Sum the product counts for each province
               },
          },
          {
               // Project the result in the desired format [{ province: 'Dhaka', productCount: 10 }]
               $project: {
                    province: '$_id', // Rename _id to province
                    productCount: '$totalProducts', // Rename totalProducts to productCount
                    _id: 0, // Remove _id field
               },
          },
     ];

     try {
          const result = await Shop.aggregate(pipeline).exec(); // Use Mongoose's aggregate method
          return result; // Returns an array of { province: 'Dhaka', productCount: 10 }
     } catch (error) {
          console.error('Error fetching territories with product counts:', error);
          throw error; // Throws the error if aggregation fails
     }
};

// Export the ShopService
export const ShopService = {
     createShop,
     makeShopAdmin,
     getAllShops,
     getShopById,
     updateShopById,
     deleteShopById,
     getShopsMyShops,
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
     getShopsByShopCategory,
     getShopsByOwnerOrAdmin,
     isShopExist,
     getProductsByShopId,
     getShopAdminsByShopId,
     createShopAdmin,
     getShopOverview,
     getShopsByFollower,
     getShopsProvincesListWithProductCount,
     getShopsTerritoryListWithProductCount,
};
