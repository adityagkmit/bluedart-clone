// routes/shipments.routes.js
const express = require('express');
const shipmentController = require('../controllers/shipments.controller');
const validate = require('../middlewares/validator.middleware');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const checkDocumentVerified = require('../middlewares/document.middleware');
const applySerializer = require('../middlewares/serializer.middleware');
const { shipmentSerializer } = require('../serializers/shipments.serializer');
const responseHandler = require('../middlewares/response.middleware');
const {
  createShipmentSchema,
  shipmentIdValidateSchema,
  updateShipmentSchema,
  updateShipmentStatusSchema,
  assignAgentSchema,
  shipmentRescheduleSchema,
} = require('../validators/shipments.validator');

const router = express.Router();

// Create Shipment
router.post(
  '/',
  auth,
  checkDocumentVerified,
  roles(['Customer']),
  validate(createShipmentSchema),
  shipmentController.createShipment,
  applySerializer(shipmentSerializer),
  responseHandler
);

// Get All Shipments
router.get(
  '/',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent', 'Customer']),
  shipmentController.getShipments,
  applySerializer(shipmentSerializer),
  responseHandler
);

// Get Shipment by ID
router.get(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Customer', 'Delivery Agent', 'Admin']),
  validate(shipmentIdValidateSchema, true),
  shipmentController.getShipmentById,
  applySerializer(shipmentSerializer),
  responseHandler
);

// Get Shipment Statuses
router.get(
  '/:id/statuses',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent', 'Customer']),
  validate(shipmentIdValidateSchema, true),
  shipmentController.getShipmentStatuses,
  applySerializer(shipmentSerializer),
  responseHandler
);

// Update Shipment
router.put(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Customer']),
  validate(shipmentIdValidateSchema, true),
  validate(updateShipmentSchema),
  shipmentController.updateShipment,
  applySerializer(shipmentSerializer),
  responseHandler
);

// Delete Shipment
router.delete(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Customer'], true),
  validate(shipmentIdValidateSchema, true),
  shipmentController.deleteShipment,
  applySerializer(shipmentSerializer),
  responseHandler
);

// Update Shipment Status
router.patch(
  '/:id/status',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent']),
  validate(shipmentIdValidateSchema, true),
  validate(updateShipmentStatusSchema),
  shipmentController.updateShipmentStatus,
  applySerializer(shipmentSerializer),
  responseHandler
);

// Assign Delivery Agent to Shipment
router.patch(
  '/:id/assign-agent',
  auth,
  roles(['Admin']),
  validate(shipmentIdValidateSchema, true),
  validate(assignAgentSchema),
  shipmentController.assignDeliveryAgent,
  applySerializer(shipmentSerializer),
  responseHandler
);

// Reschedule Shipment
router.patch(
  '/:id/reschedule',
  auth,
  checkDocumentVerified,
  roles(['Customer', 'Admin']),
  validate(shipmentRescheduleSchema),
  shipmentController.rescheduleShipment,
  applySerializer(shipmentSerializer),
  responseHandler
);

module.exports = router;
