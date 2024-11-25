const express = require('express');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validator.middleware');
const checkDocumentVerified = require('../middlewares/document.middleware');
const reportController = require('../controllers/reports.controller');
const { shipmentReportSchema, customerReportSchema } = require('../validators/reports.validator');
const { ADMIN, CUSTOMER } = require('../constants/roles');
const responseHandler = require('../middlewares/response.middleware');
const reportsSerializer = require('../serializers/reports.serializer');
const applySerializer = require('../middlewares/serializer.middleware');

const router = express.Router();

// Admin generates shipment reports
router.post(
  '/shipments',
  auth,
  roles([ADMIN]),
  validate(shipmentReportSchema),
  reportController.generateShipmentReport,
  applySerializer(reportsSerializer),
  responseHandler
);

// Customer generates their own reports
router.post(
  '/customers',
  auth,
  checkDocumentVerified,
  roles([CUSTOMER]),
  validate(customerReportSchema),
  reportController.generateCustomerReport,
  applySerializer(reportsSerializer),
  responseHandler
);

module.exports = router;
