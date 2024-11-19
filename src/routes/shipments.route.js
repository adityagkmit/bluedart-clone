const express = require('express');
const shipmentController = require('../controllers/shipments.controller');
const validate = require('../middlewares/validator.middleware');
const {
  createShipmentSchema,
  shipmentIdValidateSchema,
  updateShipmentSchema,
  updateShipmentStatusSchema,
  assignAgentSchema,
  shipmentRescheduleSchema,
} = require('../validators/shipments.validator');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const checkDocumentVerified = require('../middlewares/document.middleware');

const router = express.Router();

router.post(
  '/',
  auth,
  checkDocumentVerified,
  roles(['Customer']),
  validate(createShipmentSchema),
  shipmentController.createShipment
);

router.get(
  '/',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent', 'Customer']),
  shipmentController.getShipments
);

router.get(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Customer', 'Delivery Agent', 'Admin']),
  validate(shipmentIdValidateSchema, true),
  shipmentController.getShipmentById
);

router.get(
  '/:id/statuses',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent', 'Customer']),
  shipmentController.getShipmentStatuses,
  validate(shipmentIdValidateSchema, true)
);

router.put(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Customer']),
  validate(shipmentIdValidateSchema, true),
  validate(updateShipmentSchema),
  shipmentController.updateShipment
);

router.delete(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Customer'], true),
  validate(shipmentIdValidateSchema, true),
  shipmentController.deleteShipment
);

router.patch(
  '/:id/status',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent']),
  validate(shipmentIdValidateSchema, true),
  validate(updateShipmentStatusSchema),
  shipmentController.updateShipmentStatus
);

router.patch(
  '/:id/assign-agent',
  auth,
  roles(['Admin']),
  validate(shipmentIdValidateSchema, true),
  validate(assignAgentSchema),
  shipmentController.assignDeliveryAgent
);

router.patch(
  '/:id/reschedule',
  auth,
  checkDocumentVerified,
  roles(['Customer', 'Admin']),
  validate(shipmentRescheduleSchema),
  shipmentController.rescheduleShipment
);

module.exports = router;
