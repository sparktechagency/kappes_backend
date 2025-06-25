import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLES } from '../user/user.enums';
import { createCouponValidation } from './coupon.validation';
import { CouponController } from './coupon.controller';

const router = Router();

// Define routes
router.post('/create', auth(USER_ROLES.VENDOR,USER_ROLES.SHOP_ADMIN),
    validateRequest(createCouponValidation.createCouponValidationSchema), CouponController.createCoupon);

router.get('/super-admin', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), CouponController.getAllCoupon);
router.get('/shop/:shopId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN), CouponController.getAllCouponByShopId);

router.patch(
    '/:couponCode/update-coupon',
    validateRequest(createCouponValidation.updateCouponValidationSchema),
    auth(USER_ROLES.VENDOR,USER_ROLES.SHOP_ADMIN),
    CouponController.updateCoupon
);

router.post(
    '/:couponCode',
    validateRequest(createCouponValidation.getCouponByCodeValidationSchema),
    CouponController.getCouponByCode
);

router.delete(
    '/:couponId',
    auth(USER_ROLES.VENDOR,USER_ROLES.SHOP_ADMIN),
    CouponController.deleteCoupon
);

export const CouponRoutes = router;
