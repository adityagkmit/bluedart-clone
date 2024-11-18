const Joi = require('joi');

const createShipmentSchema = Joi.object({
  pickup_address: Joi.string().min(5).required(),
  delivery_address: Joi.string().min(5).required(),
  weight: Joi.number().positive().required(),
  dimensions: Joi.object({
    length: Joi.number().positive().required(),
    width: Joi.number().positive().required(),
    height: Joi.number().positive().required(),
  }).required(),
  is_fragile: Joi.boolean(),
  delivery_option: Joi.string().valid('Standard', 'Express').required(),
  preferred_delivery_date: Joi.date().optional(),
  preferred_delivery_time: Joi.string().optional(),
});

const shipmentIdValidateSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const updateShipmentSchema = Joi.object({
  pickup_address: Joi.string().min(5).optional(),
  delivery_address: Joi.string().min(5).optional(),
  weight: Joi.number().positive().optional(),
  dimensions: Joi.object({
    length: Joi.number().positive().optional(),
    width: Joi.number().positive().optional(),
    height: Joi.number().positive().optional(),
  }).optional(),
  is_fragile: Joi.boolean(),
  delivery_option: Joi.string().valid('Standard', 'Express').optional(),
  preferred_delivery_date: Joi.date().optional(),
  preferred_delivery_time: Joi.string().optional(),
});

const updateShipmentStatusSchema = Joi.object({
  status: Joi.string().valid('Pending', 'In Transit', 'Out for Delivery', 'Delivered').required(),
});

const assignAgentSchema = Joi.object({
  delivery_agent_id: Joi.string().uuid().required().messages({
    'string.base': 'Delivery agent ID must be a valid UUID',
    'string.empty': 'Delivery agent ID cannot be empty',
    'any.required': 'Delivery agent ID is required',
  }),
});

const shipmentRescheduleSchema = Joi.object({
  preferred_delivery_date: Joi.date().required().messages({
    'date.base': 'Preferred delivery date must be a valid date.',
    'any.required': 'Preferred delivery date is required.',
  }),
  preferred_delivery_time: Joi.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Preferred delivery time must be in HH:MM:SS format.',
      'any.required': 'Preferred delivery time is required.',
    }),
});

module.exports = {
  createShipmentSchema,
  shipmentIdValidateSchema,
  updateShipmentSchema,
  updateShipmentStatusSchema,
  assignAgentSchema,
  shipmentRescheduleSchema,
};
