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

module.exports = {
  createShipmentSchema,
  shipmentIdValidateSchema,
};
