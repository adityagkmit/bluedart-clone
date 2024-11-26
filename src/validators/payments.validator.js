const Joi = require('joi');

const createPaymentSchema = Joi.object({
  shipmentId: Joi.string().uuid().required().messages({
    'any.required': 'Shipment ID is required',
    'string.uuid': 'Shipment ID must be a valid UUID',
  }),
  method: Joi.string().valid('Online', 'COD').default('Online').messages({
    'any.only': 'Payment method must be either "Online" or "COD"',
  }),
  transactionDetails: Joi.string().optional(),
});

const paymentIdValidateSchema = Joi.object({
  id: Joi.string().uuid().required().label('Payment ID'),
});

module.exports = {
  createPaymentSchema,
  paymentIdValidateSchema,
};
