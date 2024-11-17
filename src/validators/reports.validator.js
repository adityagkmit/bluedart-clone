const Joi = require('joi');

// Shipment Report Validator
const shipmentReportSchema = Joi.object({
  status: Joi.string().valid('Delivered', 'Pending', 'In Transit', 'Cancelled'),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  maxPrice: Joi.number().positive(),
  user_id: Joi.string().uuid(),
  roles: Joi.array()
    .items(Joi.string().valid('Admin', 'Customer', 'Delivery Agent'))
    .required(),
});

// Customer Report Validator
const customerReportSchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  maxPrice: Joi.number().positive(),
  status: Joi.string().valid('Delivered', 'Pending', 'In Transit', 'Cancelled'),
});

module.exports = {
  shipmentReportSchema,
  customerReportSchema,
};
