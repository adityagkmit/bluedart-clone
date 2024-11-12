const Joi = require('joi');

const userIdValidateSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.base': 'User ID should be a type of text',
    'string.empty': 'User ID cannot be an empty field',
    'string.uuid': 'User ID must be a valid UUID',
    'any.required': 'User ID is a required field',
  }),
});

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.base': 'Name should be a type of text',
    'string.empty': 'Name cannot be an empty field',
    'any.required': 'Name is a required field',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is a required field',
  }),
  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be a 10-digit number',
      'any.required': 'Phone number is a required field',
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is a required field',
  }),
  roles: Joi.array().items(Joi.string()).optional().messages({
    'string.base': 'Roles should be a type of text',
  }),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    'string.base': 'Name should be a type of text',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please enter a valid email',
  }),
  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be a 10-digit number',
    }),
  password: Joi.string().min(6).optional().messages({
    'string.min': 'Password must be at least 6 characters long',
  }),
});

module.exports = {
  userIdValidateSchema,
  createUserSchema,
  updateUserSchema,
};
