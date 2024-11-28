const express = require('express');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validator.middleware');
const checkDocumentVerification = require('../middlewares/document.middleware');
const reportController = require('../controllers/reports.controller');
const { shipmentReportSchema, customerReportSchema } = require('../validators/reports.validator');
const { ADMIN, CUSTOMER } = require('../constants/roles');
const { responseHandler } = require('../helpers/response.helper');
const reportsSerializer = require('../serializers/reports.serializer');

const router = express.Router();

// Admin generates shipment reports
router.post(
  '/shipments',
  auth,
  roles([ADMIN]),
  validate(shipmentReportSchema),
  reportController.generateShipmentReport,
  reportsSerializer,
  responseHandler
);

// Customer generates their own reports
router.post(
  '/customers',
  auth,
  checkDocumentVerification,
  roles([CUSTOMER]),
  validate(customerReportSchema),
  reportController.generateCustomerReport,
  reportsSerializer,
  responseHandler
);

module.exports = router;
