import { FOLDER_NAMES } from "../../../enums/files";
import auth from "../../middleware/auth";
import fileUploadHandler from "../../middleware/fileUploadHandler";
import parseFileData from "../../middleware/parseFileData";
import parseMulitpleFieldsData from "../../middleware/parseMulitpleFieldsData";
import validateRequest from "../../middleware/validateRequest";
import { USER_ROLES } from "../user/user.enums";
import { ShopController } from "./shop.controller";
import { ShopValidation } from "./shop.validation";
// necessasry routes for shop
const express = require('express');
const router = express.Router();

// Import necessary controllers

// Get all shops
router.get('/', ShopController.getAllShops);
router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), fileUploadHandler(), parseMulitpleFieldsData(FOLDER_NAMES.LOGO, FOLDER_NAMES.BANNER, FOLDER_NAMES.COVER_PHOTO), validateRequest(ShopValidation.createShopZodSchema), ShopController.createShop);

router.patch('/make-shop-admin/:shopId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), validateRequest(ShopValidation.makeShopAdminZodSchema), ShopController.makeShopAdmin);

// get users shops
router.get('/user', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), ShopController.getShopsByOwnerOrAdmin);

// Get a shop by ID
router.get('/:id', ShopController.getShopById);
// Update a shop by ID
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), fileUploadHandler(), validateRequest(ShopValidation.updateShopZodSchema), parseMulitpleFieldsData(FOLDER_NAMES.LOGO, FOLDER_NAMES.BANNER, FOLDER_NAMES.COVER_PHOTO), ShopController.updateShopById);


// router.patch('/update-revenue/:shopId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), validateRequest(ShopValidation.updateRevenueZodSchema), ShopController.updateRevenue);


// Get followed shops by user
// router.get('/shop/:userId', ShopController.getShopsByFollower);
// const getShopsByFollower = catchAsync(async (req: Request, res: Response) => {
//     const { followerId } = req.params;
//     const result = await ShopService.getShopsByFollower(followerId);
//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: 'Shops by follower retrieved successfully',
//         data: result,
//     });
// });
// Delete a shop by ID
// router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), ShopController.deleteShopById);
// // Get shops by owner
// router.get('/owner/:ownerId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), ShopController.getShopsByOwner);
// // Get shops by location
// router.get('/location', ShopController.getShopsByLocation);
// // Get shops by getShopsByShopCategory
// router.get('/shopCategory/:category', ShopController.getShopsByShopCategory);
// // Get chats by shop
// router.get('/:shopId/chats', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), ShopController.getChatsByShop);
// // Get orders by shop
// router.get('/:shopId/orders', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), ShopController.getOrdersByShop);
// // Get coupons by shop
// router.get('/:shopId/coupons', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), ShopController.getCouponsByShop);
// // Get admins by shop
// router.get('/:shopId/admins', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), ShopController.getAdminsByShop);
// // Get followers by shop
// router.get('/:shopId/followers', ShopController.getFollowersByShop);
// // make admin for shop
// // router.post('/:shopId/admins', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), ShopController.addAdminToShop);
// // remove admin from shop
// // router.delete('/:shopId/admins/:adminId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), ShopController.removeAdminFromShop);
// // toggle Follow-unfollow a shop
// router.post('/follow-unfollow/:shopId', ShopController.toggleFollowUnfollowShop);

// Export the router
export const ShopRoutes = router;