import express from 'express';
import { ChatController } from './chat.controller';
import { USER_ROLES } from '../user/user.enums';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { ChatValidation } from './chat.validation';
const router = express.Router();

router.post('/', auth(USER_ROLES.USER, USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR), validateRequest(ChatValidation.createChatZodSchema), ChatController.createChat);
router.get('/user', auth(USER_ROLES.USER), ChatController.getChatForUser);
router.get('/shop/:id', auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR), ChatController.getChatForShopAdminOrOwner);

export const ChatRoutes = router;
