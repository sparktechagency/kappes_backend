import { Router } from 'express';
import { paymenController } from './payment.controller';
import { USER_ROLES } from '../user/user.enums';
import auth from '../../middleware/auth';

export const paymentRoutes = Router();

paymentRoutes
  .post('/', auth(USER_ROLES.USER), paymenController.createPayment)
  .get(
    '/',
    auth(USER_ROLES.USER, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN),
    paymenController.getPaymentByCustomer,
  )

  .get(
    '/owner',
    auth(USER_ROLES.VENDOR),
    paymenController.getAllPaymentByOwnerId,
  )

  .get(
    '/admin',
    auth(USER_ROLES.SUPER_ADMIN,USER_ROLES.ADMIN),
    paymenController.getAllPaymentByAdmin,
  )
  .get(
    '/admin/:id',
    auth(USER_ROLES.SUPER_ADMIN,USER_ROLES.ADMIN),
    paymenController.getPaymentDetailByAdminById,
  )
  .delete(
    '/admin/:id',
    auth(USER_ROLES.SUPER_ADMIN,USER_ROLES.ADMIN),
    paymenController.deletePaymentDetailByAdminById,
  )
  .get(
    '/last-12-months-earnings',
    auth(USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN),
    paymenController.getLast12MonthsEarnings,
  )
  .get('/success', paymenController.successPage)
  .get('/cancel', paymenController.cancelPage);
