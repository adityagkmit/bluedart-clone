const reportService = require('../services/reports.service');
const { ApiResponse, ApiError } = require('../helpers/response.helper');

exports.generateShipmentReport = async (req, res) => {
  try {
    const { id: userId, roles } = req.user;
    const filters = req.query;

    // Generate the report
    const report = await reportService.generateShipmentReport(filters, userId, roles);

    return ApiResponse.send(res, 200, 'Shipment report generated successfully', report);
  } catch (error) {
    console.error('Error generating shipment report:', error);

    return ApiError.handleError(
      error instanceof ApiError ? error : new ApiError(500, 'Failed to generate shipment report.'),
      res
    );
  }
};
