const express = require('express');
const paymentController = require('../controllers/payments.controller');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validator.middleware');
const checkDocumentVerified = require('../middlewares/document.middleware');
const { createPaymentSchema, paymentIdValidateSchema } = require('../validators/payments.validator');

const router = express.Router();

router.post(
  '/',
  auth,
  checkDocumentVerified,
  roles(['Customer']),
  validate(createPaymentSchema),
  paymentController.createPayment
);

router.patch(
  '/:id/status',
  auth,
  checkDocumentVerified,
  roles(['Delivery Agent']),
  validate(paymentIdValidateSchema, true),
  paymentController.completeCODPayment
);

router.get(
  '/:id',
  auth,
  checkDocumentVerified,
  roles(['Admin', 'Delivery Agent', 'Customer']),
  validate(paymentIdValidateSchema, true),
  paymentController.getPaymentById
);

router.get('/', auth, checkDocumentVerified, roles(['Admin', 'Customer']), paymentController.getPayments);

module.exports = router;
