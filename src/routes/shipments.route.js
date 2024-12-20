// routes/shipments.routes.js
const express = require('express');
const shipmentController = require('../controllers/shipments.controller');
const validate = require('../middlewares/validator.middleware');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const checkDocumentVerification = require('../middlewares/document.middleware');
const { shipmentSerializer } = require('../serializers/shipments.serializer');
const { ADMIN, CUSTOMER, DELIVERYAGENT } = require('../constants/roles');
const { responseHandler } = require('../helpers/response.helper');
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
  checkDocumentVerification,
  roles([CUSTOMER]),
  validate(createShipmentSchema),
  shipmentController.createShipment,
  shipmentSerializer,
  responseHandler
);

// Get All Shipments
router.get(
  '/',
  auth,
  checkDocumentVerification,
  roles([ADMIN]),
  shipmentController.getShipments,
  shipmentSerializer,
  responseHandler
);

// Get Shipment by ID
router.get(
  '/:id',
  auth,
  checkDocumentVerification,
  roles([ADMIN, DELIVERYAGENT, CUSTOMER]),
  validate(shipmentIdValidateSchema, true),
  shipmentController.getShipmentById,
  shipmentSerializer,
  responseHandler
);

// Get Shipment Statuses
router.get(
  '/:id/statuses',
  auth,
  checkDocumentVerification,
  roles([ADMIN, DELIVERYAGENT, CUSTOMER]),
  validate(shipmentIdValidateSchema, true),
  shipmentController.getShipmentStatuses,
  shipmentSerializer,
  responseHandler
);

// Update Shipment
router.put(
  '/:id',
  auth,
  checkDocumentVerification,
  roles([ADMIN, CUSTOMER]),
  validate(shipmentIdValidateSchema, true),
  validate(updateShipmentSchema),
  shipmentController.updateShipment,
  shipmentSerializer,
  responseHandler
);

// Delete Shipment
router.delete(
  '/:id',
  auth,
  checkDocumentVerification,
  roles([ADMIN, CUSTOMER], true),
  validate(shipmentIdValidateSchema, true),
  shipmentController.deleteShipment,
  shipmentSerializer,
  responseHandler
);

// Update Shipment By Action
router.patch(
  '/:id',
  auth,
  checkDocumentVerification,
  validate(shipmentIdValidateSchema, true),
  validate(unifiedShipmentSchema),
  shipmentController.updateShipmentThroughAction,
  shipmentSerializer,
  responseHandler
);

module.exports = router;
