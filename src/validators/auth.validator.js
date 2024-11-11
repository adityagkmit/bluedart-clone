const Joi = require('joi');

const sendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = {
  sendOtpSchema,
};
