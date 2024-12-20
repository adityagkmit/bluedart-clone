const Joi = require('joi');

const createShipmentSchema = Joi.object({
  pickupAddress: Joi.string().min(5).required(),
  deliveryAddress: Joi.string().min(5).required(),
  weight: Joi.number().positive().required(),
  dimensions: Joi.object({
    length: Joi.number().positive().required(),
    width: Joi.number().positive().required(),
    height: Joi.number().positive().required(),
  }).required(),
  isFragile: Joi.boolean(),
  deliveryOption: Joi.string().valid('Standard', 'Express').required(),
  preferredDeliveryDate: Joi.date().optional(),
  preferredDeliveryTime: Joi.string().optional(),
});

const shipmentIdValidateSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const updateShipmentSchema = Joi.object({
  pickupAddress: Joi.string().min(5).optional(),
  deliveryAddress: Joi.string().min(5).optional(),
  weight: Joi.number().positive().optional(),
  dimensions: Joi.object({
    length: Joi.number().positive().optional(),
    width: Joi.number().positive().optional(),
    height: Joi.number().positive().optional(),
  }).optional(),
  isFragile: Joi.boolean(),
  deliveryOption: Joi.string().valid('Standard', 'Express').optional(),
  preferredDeliveryDate: Joi.date().optional(),
  preferredDeliveryTime: Joi.string().optional(),
});

const unifiedShipmentSchema = Joi.object({
  action: Joi.string().valid('updateStatus', 'assignAgent', 'reschedule').required(),
  preferredDeliveryDate: Joi.date(),
  preferredDeliveryTime: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/),
  deliveryAgentId: Joi.string().uuid(),
  status: Joi.string().valid('Pending', 'In Transit', 'Out for Delivery', 'Delivered'),
});

module.exports = {
  createShipmentSchema,
  shipmentIdValidateSchema,
  updateShipmentSchema,
  unifiedShipmentSchema,
};
