import { Router } from 'express';
import { OrderController } from './order.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import validateRequest from '../../middleware/validateRequest';
import { OrderValidation } from './order.validation';

const router = Router();

// Define routes
router.get('/my-shop-orders', auth(USER_ROLES.USER), OrderController.getMyShopOrders);

router.get('/my-orders', auth(USER_ROLES.USER), OrderController.getMyOrders);

router.post('/create', validateRequest(OrderValidation.createOrderSchema), auth(USER_ROLES.USER), OrderController.createOrder);

router.get('/refund-order-requests/:shopId', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), OrderController.getAllRefundOrderRequests);

router.post('/refund/:orderId', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), OrderController.refundOrder);

router.get('/shop/:shopId', auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR), OrderController.getOrdersByShopId);

router.patch('/status/:orderId', auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR), validateRequest(OrderValidation.updateOrderStatusSchema), OrderController.changeOrderStatus);

router.get('/:orderId', auth(USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN, USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), OrderController.getOrderDetails);

// Cancel order
router.delete('/cancel/:id', auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR), OrderController.cancelOrder);

export const OrderRoutes = router;
