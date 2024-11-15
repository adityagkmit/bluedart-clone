const express = require('express');
const shipmentController = require('../controllers/shipments.controller');
const validate = require('../middlewares/validator.middleware');
const {
  createShipmentSchema,
  shipmentIdValidateSchema,
  updateShipmentSchema,
  updateShipmentStatusSchema,
  assignAgentSchema,
} = require('../validators/shipments.validator');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');

const router = express.Router();

router.post(
  '/',
  auth,
  roles(['Customer']),
  validate(createShipmentSchema),
  shipmentController.createShipment
);

router.get('/', auth, roles(['Admin', 'Delivery Agent', 'Customer']), shipmentController.getShipments);

router.get(
  '/:id',
  auth,
  roles(['Customer', 'Delivery Agent', 'Admin']),
  validate(shipmentIdValidateSchema, true),
  shipmentController.getShipmentById
);

router.get(
  '/:id/statuses',
  auth,
  roles(['Admin', 'Delivery Agent', 'Customer']),
  shipmentController.getShipmentStatuses,
  validate(shipmentIdValidateSchema, true)
);

router.put(
  '/:id',
  auth,
  roles(['Admin', 'Customer']),
  validate(shipmentIdValidateSchema, true),
  validate(updateShipmentSchema),
  shipmentController.updateShipment
);

router.delete(
  '/:id',
  auth,
  roles(['Admin', 'Customer'], true),
  validate(shipmentIdValidateSchema, true),
  shipmentController.deleteShipment
);

router.patch(
  '/:id/status',
  auth,
  validate(shipmentIdValidateSchema, true),
  validate(updateShipmentStatusSchema),
  roles(['Admin', 'Delivery Agent']),
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

module.exports = router;
