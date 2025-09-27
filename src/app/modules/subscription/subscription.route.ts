import express from 'express';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionValidation } from './subscription.validation';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLES } from '../user/user.enums';

const router = express.Router();
router.post(
  '/create',
  auth(USER_ROLES.VENDOR),
  validateRequest(SubscriptionValidation.createSubscriptionZodSchema),
  SubscriptionController.createSubscription
);
router.post('/create-checkout-session/:id', auth(USER_ROLES.VENDOR), SubscriptionController.createCheckoutSession);
router.get('/success', SubscriptionController.subscriptionSuccess);
router.get('/cancel', SubscriptionController.subscriptionCancel);


router.get('/', SubscriptionController.getAllSubscriptions);
// get-my-subscription
router.get('/my-subscription', auth(USER_ROLES.VENDOR), SubscriptionController.getMySubscriptions);
router.get('/:id', SubscriptionController.getSubscriptionById);
router.patch(
  '/:id',
  auth(USER_ROLES.VENDOR),
  validateRequest(SubscriptionValidation.updateSubscriptionZodSchema),
  SubscriptionController.updateSubscription
);
router.delete(
  '/:id',
  auth(USER_ROLES.VENDOR),
  SubscriptionController.deleteSubscription
);

export const SubscriptionRoutes = router;
