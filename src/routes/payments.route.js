const express = require('express');
const paymentController = require('../controllers/payments.controller');
const validate = require('../middlewares/validator.middleware');
const { createPaymentSchema, paymentIdValidateSchema } = require('../validators/payments.validator');
const { auth } = require('../middlewares/auth.middleware');
const { ADMIN, CUSTOMER, DELIVERYAGENT } = require('../constants/roles');
const roles = require('../middlewares/role.middleware');
const checkDocumentVerified = require('../middlewares/document.middleware');
const responseHandler = require('../middlewares/response.middleware');
const paymentsSerializer = require('../serializers/payments.serializer');
const applySerializer = require('../middlewares/serializer.middleware');

const router = express.Router();

router.post(
  '/',
  auth,
  checkDocumentVerified,
  roles([CUSTOMER]),
  validate(createPaymentSchema),
  paymentController.createPayment,
  applySerializer(paymentsSerializer),
  responseHandler
);

router.patch(
  '/:id',
  auth,
  checkDocumentVerified,
  roles([DELIVERYAGENT]),
  validate(paymentIdValidateSchema, true),
  paymentController.completeCODPayment,
  applySerializer(paymentsSerializer),
  responseHandler
);

router.get(
  '/:id',
  auth,
  checkDocumentVerified,
  roles([ADMIN, CUSTOMER, DELIVERYAGENT]),
  validate(paymentIdValidateSchema, true),
  paymentController.getPaymentById,
  applySerializer(paymentsSerializer),
  responseHandler
);

router.get(
  '/',
  auth,
  checkDocumentVerified,
  roles([ADMIN, CUSTOMER]),
  paymentController.getPayments,
  applySerializer(paymentsSerializer),
  responseHandler
);

module.exports = router;
