const Joi = require('joi');

const createStatusSchema = Joi.object({
  shipment_id: Joi.string().uuid().required(),
  name: Joi.string().valid('Pending', 'In Transit', 'Out for Delivery', 'Delivered').default('Pending'),
});

module.exports = {
  createStatusSchema,
};
