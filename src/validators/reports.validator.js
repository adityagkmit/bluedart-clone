const Joi = require('joi');

const shipmentReportSchema = Joi.object({
  dateFrom: Joi.date().required().label('Start Date'),
  dateTo: Joi.date().required().label('End Date'),
});

module.exports = {
  shipmentReportSchema,
};
