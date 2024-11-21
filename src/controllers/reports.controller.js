const reportService = require('../services/reports.service');
const { ApiError } = require('../helpers/response.helper');

const generateShipmentReport = async (req, res, next) => {
  try {
    const { id: userId, roles } = req.user;
    const filters = req.body;

    const report = await reportService.generateShipmentReport(filters, userId, roles);
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
    const userId = req.user.id;

    const report = await reportService.generateCustomerReport(req.body, userId);
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
