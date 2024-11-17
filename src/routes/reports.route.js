const express = require('express');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validator.middleware');
const reportController = require('../controllers/reports.controller');
const { shipmentReportSchema } = require('../validators/reports.validator');

const router = express.Router();

// Admin generates shipment reports
router.post(
  '/shipments',
  auth,
  roles(['Admin']),
  validate(shipmentReportSchema),
  reportController.generateShipmentReport
);

module.exports = router;
