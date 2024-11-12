const Joi = require('joi');

const userIdValidateSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.base': 'User ID should be a type of text',
    'string.empty': 'User ID cannot be an empty field',
    'string.uuid': 'User ID must be a valid UUID',
    'any.required': 'User ID is a required field',
  }),
});

module.exports = {
  userIdValidateSchema,
};
