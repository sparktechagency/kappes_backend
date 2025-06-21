import { ShopController } from "./shop.controller";

// necessasry routes for shop
const express = require('express');
const router = express.Router();

// Import necessary controllers
// Create a new shop
router.post('/', ShopController.createShop);
// Get all shops
router.get('/', ShopController.getAllShops);
// Get a shop by ID
router.get('/:id', ShopController.getShopById);
// Update a shop by ID
router.put('/:id', ShopController.updateShopById);
// Delete a shop by ID
router.delete('/:id', ShopController.deleteShopById);
// Get shops by owner
router.get('/owner/:ownerId', ShopController.getShopsByOwner);
// Get shops by location
router.get('/location', ShopController.getShopsByLocation);
// Get shops by getShopsByShopCategory
router.get('/shopCategory/:category', ShopController.getShopsByShopCategory);
// Get chats by shop
router.get('/:shopId/chats', ShopController.getChatsByShop);
// Get orders by shop
router.get('/:shopId/orders', ShopController.getOrdersByShop);
// Get coupons by shop
router.get('/:shopId/coupons', ShopController.getCouponsByShop);
// Get admins by shop
router.get('/:shopId/admins', ShopController.getAdminsByShop);
// Get followers by shop
router.get('/:shopId/followers', ShopController.getFollowersByShop);
// make admin for shop
router.post('/:shopId/admins', ShopController.addAdminToShop);
// remove admin from shop
router.delete('/:shopId/admins/:adminId', ShopController.removeAdminFromShop);
// toggle Follow-unfollow a shop
router.post('/follow-unfollow/:shopId', ShopController.toggleFollowUnfollowShop);

// Export the router
export const ShopRoutes = router;