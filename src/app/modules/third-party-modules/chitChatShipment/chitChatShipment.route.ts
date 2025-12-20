import express from 'express';
import { chitChatShipmentController } from './chitChatShipment.controller';
import { chitChatShipmentValidation } from './chitChatShipment.validation';
import { USER_ROLES } from '../../user/user.enums';
import auth from '../../../middleware/auth';
import validateRequest from '../../../middleware/validateRequest';

const router = express.Router();

// List all shipments with optional filters
router.get(
     '/',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
     validateRequest(chitChatShipmentValidation.getAllChitChatShipmentsZodSchema),
     chitChatShipmentController.listShipments,
);

// Create a new shipment
router.post(
     '/',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
     validateRequest(chitChatShipmentValidation.createChitChatShipmentZodSchema),
     chitChatShipmentController.createShipment,
);

// Get a single shipment by ID
router.get(
     '/:shipmentId',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
     validateRequest(chitChatShipmentValidation.getChitChatShipmentZodSchema),
     chitChatShipmentController.getShipment,
);

// Update a shipment
router.patch(
     '/:shipmentId',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
     validateRequest(chitChatShipmentValidation.updateChitChatShipmentZodSchema),
     chitChatShipmentController.updateShipment,
);

// Delete a shipment
router.delete(
     '/:shipmentId',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
     validateRequest(chitChatShipmentValidation.deleteChitChatShipmentZodSchema),
     chitChatShipmentController.deleteShipment,
);

// Buy a shipping label for a shipment
router.post(
     '/:shipmentId/buy',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
     validateRequest(chitChatShipmentValidation.buyChitChatShipmentZodSchema),
     chitChatShipmentController.buyShipment,
);

// Cancel a shipment
router.post(
     '/:shipmentId/cancel',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
     validateRequest(chitChatShipmentValidation.cancelChitChatShipmentZodSchema),
     chitChatShipmentController.cancelShipment,
);

// Print a shipping label
router.post(
     '/:shipmentId/print',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
     validateRequest(chitChatShipmentValidation.printChitChatShipmentZodSchema),
     chitChatShipmentController.printShipment,
);

// Get a shipping label
router.get(
     '/:shipmentId/label',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
     validateRequest(chitChatShipmentValidation.getChitChatShipmentLabelZodSchema),
     chitChatShipmentController.getShipmentLabel,
);

// Get tracking information for a shipment
router.get(
     '/:shipmentId/tracking',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
     validateRequest(chitChatShipmentValidation.getChitChatShipmentTrackingZodSchema),
     chitChatShipmentController.getShipmentTracking,
);

export const chitChatShipmentRoutes = router;
