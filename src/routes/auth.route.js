const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validator.middleware');
const { auth } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer.middleware');
const {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  loginSchema,
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/send-otp', validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.delete('/logout', auth, authController.logout);
router.post('/verify-document', auth, upload.single('document'), authController.verifyDocument);

module.exports = router;
