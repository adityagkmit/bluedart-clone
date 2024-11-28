const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validator.middleware');
const { auth } = require('../middlewares/auth.middleware');
const { authSerializer } = require('../serializers/auth.serializer');
const { responseHandler } = require('../helpers/response.helper');
const {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/send-otp', validate(sendOtpSchema), authController.sendOtp, authSerializer, responseHandler);

router.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  authController.verifyOtp,
  authSerializer,
  responseHandler
);

router.post('/register', validate(registerSchema), authController.register, authSerializer, responseHandler);

router.post('/login', validate(loginSchema), authController.login, authSerializer, responseHandler);

router.delete('/logout', auth, authController.logout, authSerializer, responseHandler);

module.exports = router;
