const express = require('express');
const paymentController = require('../controllers/payments.controller');
const validate = require('../middlewares/validator.middleware');
const { createPaymentSchema, paymentIdValidateSchema } = require('../validators/payments.validator');
const { auth } = require('../middlewares/auth.middleware');
const { ADMIN, CUSTOMER, DELIVERYAGENT } = require('../constants/roles');
const roles = require('../middlewares/role.middleware');
const checkDocumentVerification = require('../middlewares/document.middleware');
const { responseHandler } = require('../helpers/response.helper');
const paymentsSerializer = require('../serializers/payments.serializer');

const router = express.Router();

router.post(
  '/',
  auth,
  checkDocumentVerification,
  roles([CUSTOMER]),
  validate(createPaymentSchema),
  paymentController.createPayment,
  paymentsSerializer,
  responseHandler
);

router.patch(
  '/:id',
  auth,
  checkDocumentVerification,
  roles([DELIVERYAGENT]),
  validate(paymentIdValidateSchema, true),
  paymentController.completeCODPayment,
  paymentsSerializer,
  responseHandler
);

router.get(
  '/:id',
  auth,
  checkDocumentVerification,
  roles([ADMIN, CUSTOMER, DELIVERYAGENT]),
  validate(paymentIdValidateSchema, true),
  paymentController.getPaymentById,
  paymentsSerializer,
  responseHandler
);

router.get(
  '/',
  auth,
  checkDocumentVerification,
  roles([ADMIN, CUSTOMER]),
  paymentController.getPayments,
  paymentsSerializer,
  responseHandler
);

module.exports = router;
