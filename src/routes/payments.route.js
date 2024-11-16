const express = require('express');
const paymentController = require('../controllers/payments.controller');
const { auth } = require('../middlewares/auth.middleware');
const roles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validator.middleware');
const { createPaymentSchema, paymentIdValidateSchema } = require('../validators/payments.validator');

const router = express.Router();

router.post('/', auth, roles(['Customer']), validate(createPaymentSchema), paymentController.createPayment);

router.patch(
  '/:id/status',
  auth,
  roles(['Delivery Agent']),
  validate(paymentIdValidateSchema, true),
  paymentController.completeCODPayment
);

module.exports = router;
