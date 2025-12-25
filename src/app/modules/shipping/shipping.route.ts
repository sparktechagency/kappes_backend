import express from 'express';
import auth from '../../middleware/auth';
import { ShippingController } from './shipping.controller';
import { USER_ROLES } from '../user/user.enums';
const router = express.Router();

//ShipStation APIs
router.get('/orders', auth(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ShippingController.getListOrders);
router.post('/orders/create-order', ShippingController.createOrder);
router.post('/orders/create-label/:id', ShippingController.createLabelForOrder);
router.get('/carriers', ShippingController.getCarriers);
router.get('/carriers/listservices', ShippingController.getListServices);


// PUBLIC (frontend-safe)
router.post('/orders', ShippingController.createOrder);
// router.post('/orders/:orderId/label', ShippingController.createLabel);

// // OPTIONAL ADMIN
// router.get('/admin/shipstation/orders', ShippingController.getShipStationOrders);
router.get('/admin/shipstation/carriers', ShippingController.getCarriers);
router.get('/admin/shipstation/services/:carrierCode', ShippingController.getListServices);


router.get('/shipstation/costs', ShippingController.getShipStationOrderCost);
router.get('/chitchats/costs', ShippingController.getChitChatsShippingCost);

export const ShippingRoutes = router;