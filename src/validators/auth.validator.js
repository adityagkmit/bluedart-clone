const Joi = require('joi');

const sendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

module.exports = {
  sendOtpSchema,
  verifyOtpSchema,
};
