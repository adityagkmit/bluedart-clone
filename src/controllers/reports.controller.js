const reportService = require('../services/reports.service');
const { ApiResponse, ApiError } = require('../helpers/response.helper');

exports.generateShipmentReport = async (req, res) => {
  try {
    const { id: userId, roles } = req.user;
    const filters = req.body;

    // Generate the report
    const report = await reportService.generateShipmentReport(filters, userId, roles);

    return ApiResponse.send(res, 200, 'Shipment report generated successfully', report);
  } catch (error) {
    console.error('Error generating shipment report:', error);

    return ApiError.handleError(
      error instanceof ApiError ? error : new ApiError(400, 'Failed to generate shipment report.'),
      res
    );
  }
};

exports.generateCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const userId = req.user.id;

    const report = await reportService.generateCustomerReport({ startDate, endDate }, userId);

    return ApiResponse.send(res, 200, 'Customer report generated successfully', report);
  } catch (error) {
    console.error('Error generating customer report:', error);
    return ApiError.handleError(new ApiError(400, 'An error occurred while generating the report'), res);
  }
};
