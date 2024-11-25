const express = require('express');
const paymentController = require('../controllers/payments.controller');
const validate = require('../middlewares/validator.middleware');
const { createPaymentSchema, paymentIdValidateSchema } = require('../validators/payments.validator');
const { auth } = require('../middlewares/auth.middleware');
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
  roles(['Customer']),
  validate(createPaymentSchema),
  paymentController.createPayment,
  applySerializer(paymentsSerializer),
  responseHandler
);

router.patch(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Delivery Agent']),
  validate(paymentIdValidateSchema, true),
  paymentController.completeCODPayment,
  applySerializer(paymentsSerializer),
  responseHandler
);

router.get(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent', 'Customer']),
  validate(paymentIdValidateSchema, true),
  paymentController.getPaymentById,
  applySerializer(paymentsSerializer),
  responseHandler
);

router.get(
  '/',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Customer']),
  paymentController.getPayments,
  applySerializer(paymentsSerializer),
  responseHandler
);

module.exports = router;
