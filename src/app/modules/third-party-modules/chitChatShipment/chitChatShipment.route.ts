import express from 'express';
import { chitChatShipmentController } from './chitChatShipment.controller';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../user/user.enums';
import validateRequest from '../../../middleware/validateRequest';
import { chitChatShipmentValidation } from './chitChatShipment.validation';

const router = express.Router();

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), chitChatShipmentController.getAllChitChatShipments);
router.post(
     '/',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR),
     validateRequest(chitChatShipmentValidation.createChitChatShipmentZodSchema),
     chitChatShipmentController.createChitChatShipment,
);
router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), chitChatShipmentController.getChitChatShipmentById);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), chitChatShipmentController.hardDeleteChitChatShipment);

/* router.get('/unpaginated', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), chitChatShipmentController.getAllUnpaginatedChitChatShipments);
router.patch(
     '/:id',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR),
     validateRequest(chitChatShipmentValidation.updateChitChatShipmentZodSchema),
     chitChatShipmentController.updateChitChatShipment,
);
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.VENDOR), chitChatShipmentController.deleteChitChatShipment);
 */
export const chitChatShipmentRoutes = router;
