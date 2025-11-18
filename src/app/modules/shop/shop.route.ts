import { FOLDER_NAMES } from '../../../enums/files';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseMulitpleFieldsData from '../../middleware/parseMulitpleFieldsData';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLES } from '../user/user.enums';
import { ShopController } from './shop.controller';
import { ShopValidation } from './shop.validation';
// necessasry routes for shop
import express from 'express';
const router = express.Router();

// Import necessary controllers

// Get all shops
router.get('/', ShopController.getAllShops);
router.post(
     '/',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN),
     fileUploadHandler(),
     parseMulitpleFieldsData(FOLDER_NAMES.LOGO, FOLDER_NAMES.BANNER, FOLDER_NAMES.COVER_PHOTO),
     validateRequest(ShopValidation.createShopZodSchema),
     ShopController.createShop,
);

router.get('/shop-admin/:shopId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), ShopController.getShopAdminsByShopId);

router
     .route('/create-shop-admin/:shopId')
     .post(validateRequest(ShopValidation.createAdminZodSchema), auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), ShopController.createShopAdmin);
router.patch('/make-shop-admin/:shopId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), validateRequest(ShopValidation.makeShopAdminZodSchema), ShopController.makeShopAdmin);

// get users shops
router.get('/admin/user', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), ShopController.getShopsByOwnerOrAdmin);

// // Get shops by owner
router.get('/my-shops', auth(USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), ShopController.getShopsMyShops);
// Get a shop by ID
router.get('/products/:shopId', ShopController.getProductsByShopId);
// get shops provinces,territory with prouduct count list in a single route
router.get('/provinces', ShopController.getShopsProvincesListWithProductCount);
router.get('/territory', ShopController.getShopsTerritoryListWithProductCount);

// get shop overview
router.get('/overview/:shopId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), ShopController.getShopOverview);

// router.patch('/update-revenue/:shopId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), validateRequest(ShopValidation.updateRevenueZodSchema), ShopController.updateRevenue);

// Get followed shops by user or my followed shops
router.get('/followed/:followerId', auth(USER_ROLES.USER), ShopController.getShopsByFollower);

// toggle Follow-unfollow a shop
router.post('/follow-unfollow/:shopId', auth(USER_ROLES.USER), ShopController.toggleFollowUnfollowShop);
// Get followers by shop
router.get('/followers/:shopId', ShopController.getFollowersByShop);
// Get shops by location
router.get('/location', validateRequest(ShopValidation.getShopsByGeoLocation), ShopController.getShopsByLocation);

// Delete a shop by ID
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), ShopController.deleteShopById);

router.get('/:id', ShopController.getShopById);
// Update a shop by ID
router.patch(
     '/:id',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN),
     fileUploadHandler(),
     validateRequest(ShopValidation.updateShopZodSchema),
     parseMulitpleFieldsData(FOLDER_NAMES.LOGO, FOLDER_NAMES.BANNER, FOLDER_NAMES.COVER_PHOTO),
     ShopController.updateShopById,
);

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
// // make admin for shop
// // router.post('/:shopId/admins', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), ShopController.addAdminToShop);
// // remove admin from shop
// // router.delete('/:shopId/admins/:adminId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), ShopController.removeAdminFromShop);

// Export the router
export const ShopRoutes = router;
