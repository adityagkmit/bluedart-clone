const reportService = require('../services/reports.service');
const { ApiError } = require('../helpers/response.helper');

const generateShipmentReport = async (req, res, next) => {
  try {
    const report = await reportService.generateShipmentReport(req.body, req.user);
    res.data = report;
    res.message = 'Shipment report generated successfully';
    next();
  } catch (error) {
    console.error('Error generating shipment report:', error);
    next(new ApiError(400, 'Failed to generate shipment report.'));
  }
};

const generateCustomerReport = async (req, res, next) => {
  try {
    const report = await reportService.generateCustomerReport(req.body, req.user);
    res.data = report;
    res.message = 'Customer report generated successfully';
    next();
  } catch (error) {
    console.error('Error generating customer report:', error);
    next(new ApiError(400, 'An error occurred while generating the report'));
  }
};

module.exports = {
  generateShipmentReport,
  generateCustomerReport,
};
