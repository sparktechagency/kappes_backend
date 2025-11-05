import express from 'express';
import { chitChatShipmentController } from './chitChatShipment.controller';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../user/user.enums';
import validateRequest from '../../../middleware/validateRequest';
import { chitChatShipmentValidation } from './chitChatShipment.validation';

const router = express.Router();

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR),validateRequest(chitChatShipmentValidation.getAllChitChatShipmentsZodSchema), chitChatShipmentController.getAllChitChatShipments);
router.post(
     '/',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR),
     validateRequest(chitChatShipmentValidation.createChitChatShipmentZodSchema),
     chitChatShipmentController.createChitChatShipment,
);
router.get('/:shipMentId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), chitChatShipmentController.getChitChatShipmentByShipMentId);

router.delete('/hard-delete/:shipMentId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), chitChatShipmentController.hardDeleteChitChatShipmentByShipMentId);

export const chitChatShipmentRoutes = router;
