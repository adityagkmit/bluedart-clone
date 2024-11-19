const express = require('express');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validator.middleware');
const checkDocumentVerified = require('../middlewares/document.middleware');
const reportController = require('../controllers/reports.controller');
const { shipmentReportSchema, customerReportSchema } = require('../validators/reports.validator');

const router = express.Router();

// Admin generates shipment reports
router.post(
  '/shipments',
  auth,
  roles(['Admin']),
  validate(shipmentReportSchema),
  reportController.generateShipmentReport
);

router.post(
  '/customers',
  auth,
  checkDocumentVerified,
  roles(['Customer']),
  validate(customerReportSchema),
  reportController.generateCustomerReport
);

module.exports = router;
