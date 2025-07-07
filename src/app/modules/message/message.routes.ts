import express from 'express';
import { USER_ROLES } from '../user/user.enums';
import { MessageController } from './message.controller';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import auth from '../../middleware/auth';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { MessageValidation } from './message.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR, USER_ROLES.USER), fileUploadHandler(), parseFileData(FOLDER_NAMES.IMAGE), validateRequest(MessageValidation.createMessageValidationSchema), MessageController.sendMessage);
router.get('/chat/:id', auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR, USER_ROLES.USER), MessageController.getMessageByChatId);

export const MessageRoutes = router;
