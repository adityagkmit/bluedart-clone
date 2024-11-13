const express = require('express');
const shipmentController = require('../controllers/shipments.controller');
const validate = require('../middlewares/validator.middleware');
const { createShipmentSchema } = require('../validators/shipments.validator');
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

module.exports = router;
