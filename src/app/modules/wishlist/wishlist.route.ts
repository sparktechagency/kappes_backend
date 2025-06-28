import express from 'express';
import { WishlistController } from './wishlist.controller';
import { USER_ROLES } from '../user/user.enums';
import auth from '../../middleware/auth';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.USER),
  WishlistController.addToWishlist
);

router.delete(
  '/:productId',
  auth(USER_ROLES.USER),
  WishlistController.removeFromWishlist
);

router.get(
  '/',
  auth(USER_ROLES.USER),
  WishlistController.getWishlist
);

router.get(
  '/check/:productId',
  auth(USER_ROLES.USER),
  WishlistController.checkProductInWishlist
);

export const WishlistRoutes = router