// routes/shipments.routes.js
const express = require('express');
const shipmentController = require('../controllers/shipments.controller');
const validate = require('../middlewares/validator.middleware');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const checkDocumentVerified = require('../middlewares/document.middleware');
const applySerializer = require('../middlewares/serializer.middleware');
const { shipmentSerializer } = require('../serializers/shipments.serializer');
const { ADMIN, CUSTOMER, DELIVERYAGENT } = require('../constants/roles');
const responseHandler = require('../middlewares/response.middleware');
const {
  createShipmentSchema,
  shipmentIdValidateSchema,
  updateShipmentSchema,
  unifiedShipmentSchema,
} = require('../validators/shipments.validator');

const router = express.Router();

// Create Shipment
router.post(
  '/',
  auth,
  checkDocumentVerified,
  roles([CUSTOMER]),
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
  roles([ADMIN]),
  shipmentController.getShipments,
  applySerializer(shipmentSerializer),
  responseHandler
);

// Get Shipment by ID
router.get(
  '/:id',
  auth,
  checkDocumentVerified,
  roles([ADMIN, DELIVERYAGENT, CUSTOMER]),
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
  roles([ADMIN, DELIVERYAGENT, CUSTOMER]),
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
  roles([ADMIN, CUSTOMER]),
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
  roles([ADMIN, CUSTOMER], true),
  validate(shipmentIdValidateSchema, true),
  shipmentController.deleteShipment,
  applySerializer(shipmentSerializer),
  responseHandler
);

// Update Shipment By Action
router.patch(
  '/:id',
  auth,
  checkDocumentVerified,
  validate(shipmentIdValidateSchema, true),
  validate(unifiedShipmentSchema),
  shipmentController.updateShipmentThroughAction,
  applySerializer(shipmentSerializer),
  responseHandler
);

module.exports = router;
