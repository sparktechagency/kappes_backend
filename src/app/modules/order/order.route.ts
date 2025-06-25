import { Router } from 'express';
import { OrderController } from './order.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import validateRequest from '../../middleware/validateRequest';
import { OrderValidation } from './order.validation';

const router = Router();

// Define routes
router.get(
    '/my-shop-orders',
    auth(USER_ROLES.USER),
    OrderController.getMyShopOrders
);

router.get(
    '/my-orders',
    auth(USER_ROLES.USER),
    OrderController.getMyOrders
);

router.get(
    '/:orderId',
    auth(USER_ROLES.USER),
    OrderController.getOrderDetails
);

router.post(
    '/',
    validateRequest(OrderValidation.createOrderSchema),
    auth(USER_ROLES.USER),
    OrderController.createOrder
)

router.patch(
    '/:orderId/status',
    auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR),
    validateRequest(OrderValidation.updateOrderStatusSchema),
    OrderController.changeOrderStatus
)


// Cancel order
// router.delete(
//     '/:id/cancel',
//     auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR),
//     OrderController.cancelOrder
// );

export const OrderRoutes = router;
