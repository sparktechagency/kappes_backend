import express from 'express';
import { chitChatShipmentController } from './chitChatShipment.controller';
import { chitChatShipmentValidation } from './chitChatShipment.validation';
import validateRequest from '../../../middleware/validateRequest';

const router = express.Router();

// List all shipments with optional filters
router.get(
     '/',

     validateRequest(chitChatShipmentValidation.getAllChitChatShipmentsZodSchema),
     chitChatShipmentController.listShipments,
);

// Create a new shipment
router.post(
     '/',

     validateRequest(chitChatShipmentValidation.createChitChatShipmentZodSchema),
     chitChatShipmentController.createShipment,
);

router.post(
     '/buy/:shipmentId',

     validateRequest(chitChatShipmentValidation.buyChitChatShipmentZodSchema),
     chitChatShipmentController.buyShipment,
);

// Get a single shipment by ID
router.get(
     '/:shipmentId',
     //
     validateRequest(chitChatShipmentValidation.getChitChatShipmentZodSchema),
     chitChatShipmentController.getShipment,
);

// Update a shipment
router.patch(
     '/:shipmentId',

     validateRequest(chitChatShipmentValidation.updateChitChatShipmentZodSchema),
     chitChatShipmentController.updateShipment,
);

// Delete a shipment
router.delete(
     '/:shipmentId',

     validateRequest(chitChatShipmentValidation.deleteChitChatShipmentZodSchema),
     chitChatShipmentController.deleteShipment,
);

// // Buy a shipping label for a shipment
// router.post('/:shipmentId/buy', validateRequest(chitChatShipmentValidation.buyChitChatShipmentZodSchema), chitChatShipmentController.buyShipment);

// Cancel a shipment
router.post(
     '/:shipmentId/cancel',

     validateRequest(chitChatShipmentValidation.cancelChitChatShipmentZodSchema),
     chitChatShipmentController.cancelShipment,
);

// Cancel a shipment
router.post('/:shipmentId/refund', validateRequest(chitChatShipmentValidation.cancelChitChatShipmentZodSchema), chitChatShipmentController.cancelShipment);

// Print a shipping label
router.post(
     '/:shipmentId/print',

     validateRequest(chitChatShipmentValidation.printChitChatShipmentZodSchema),
     chitChatShipmentController.printShipment,
);

// Get a shipping label
router.get(
     '/:shipmentId/label',

     validateRequest(chitChatShipmentValidation.getChitChatShipmentLabelZodSchema),
     chitChatShipmentController.getShipmentLabel,
);

// Get tracking information for a shipment
router.get(
     '/:shipmentId/tracking',

     validateRequest(chitChatShipmentValidation.getChitChatShipmentTrackingZodSchema),
     chitChatShipmentController.getShipmentTracking,
);

export const chitChatShipmentRoutes = router;
