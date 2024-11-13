const express = require('express');
const shipmentController = require('../controllers/shipments.controller');
const validate = require('../middlewares/validator.middleware');
const { createShipmentSchema, shipmentIdValidateSchema } = require('../validators/shipments.validator');
const paginationSchema = require('../validators/pagination.validator');
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

router.get(
  '/',
  auth,
  roles(['Admin']),
  validate(paginationSchema, false, true),
  shipmentController.getAllShipments
);

router.get(
  '/:id',
  auth,
  roles(['Customer', 'Delivery Agent', 'Admin']),
  validate(shipmentIdValidateSchema, true),
  shipmentController.getShipmentById
);

module.exports = router;
