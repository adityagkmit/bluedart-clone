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

module.exports = {
  createShipmentSchema,
  shipmentIdValidateSchema,
  updateShipmentSchema,
};
