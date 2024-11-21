const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validator.middleware');
const { auth } = require('../middlewares/auth.middleware');
const { serializeAuthResponse } = require('../serializers/auth.serializer');
const responseHandler = require('../middlewares/response.middleware');
const {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
} = require('../validators/auth.validator');

const router = express.Router();

router.post(
  '/send-otp',
  validate(sendOtpSchema),
  authController.sendOtp,
  serializeAuthResponse,
  responseHandler
);

router.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  authController.verifyOtp,
  serializeAuthResponse,
  responseHandler
);

router.post(
  '/register',
  validate(registerSchema),
  authController.register,
  serializeAuthResponse,
  responseHandler
);

router.post('/login', validate(loginSchema), authController.login, serializeAuthResponse, responseHandler);

router.delete('/logout', auth, authController.logout, serializeAuthResponse, responseHandler);

module.exports = router;
