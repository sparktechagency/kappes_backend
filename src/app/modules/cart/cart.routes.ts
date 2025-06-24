// src/app/modules/cart/cart.routes.ts
import { Router } from 'express';
import { USER_ROLES } from '../user/user.enums';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from './cart.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { CartValidationSchema } from './cart.validation';

const router = Router();

// All routes require authentication
router.use(auth(USER_ROLES.USER));

// GET /api/v1/cart - Get user's cart
router.get('/', getCart);

// POST /api/v1/cart - Add items to cart
router.post('/create', validateRequest(CartValidationSchema.createCartValidation), addToCart);

// PATCH /api/v1/cart/items/:itemId - Update cart item quantity
router.patch('/items/:itemId', validateRequest(CartValidationSchema.updateCartValidation), updateCartItem);

// DELETE /api/v1/cart/items/:itemId - Remove item from cart
router.delete('/items/:itemId', removeFromCart);

// DELETE /api/v1/cart - Clear cart
router.delete('/', clearCart);

export const CartRoutes = router;