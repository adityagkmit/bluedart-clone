const {
  generateShipmentReport,
  generateCustomerReport,
} = require('../../../src/controllers/reports.controller');

const reportService = require('../../../src/services/reports.service');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('../../../src/services/reports.service');

describe('Report Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { body: {}, user: {} };
    mockRes = { data: null, message: null };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test: generateShipmentReport
  describe('generateShipmentReport', () => {
    it('should generate a shipment report successfully', async () => {
      const mockReport = { id: '1', summary: 'Shipment Report Summary' };
      reportService.generateShipmentReport.mockResolvedValue(mockReport);

      mockReq.body = { filters: { status: 'delivered' } };
      mockReq.user = { id: 'user1' };

      await generateShipmentReport(mockReq, mockRes, mockNext);

      expect(reportService.generateShipmentReport).toHaveBeenCalledWith(mockReq.body, mockReq.user);
      expect(mockRes.data).toEqual(mockReport);
      expect(mockRes.message).toBe('Shipment report generated successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during shipment report generation', async () => {
      const errorMessage = 'Failed to generate shipment report';
      reportService.generateShipmentReport.mockRejectedValue(new Error(errorMessage));

      await generateShipmentReport(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Failed to generate shipment report.');
    });
  });

  // Test: generateCustomerReport
  describe('generateCustomerReport', () => {
    it('should generate a customer report successfully', async () => {
      const mockReport = { id: '2', summary: 'Customer Report Summary' };
      reportService.generateCustomerReport.mockResolvedValue(mockReport);

      mockReq.body = { filters: { region: 'north' } };
      mockReq.user = { id: 'user1' };

      await generateCustomerReport(mockReq, mockRes, mockNext);

      expect(reportService.generateCustomerReport).toHaveBeenCalledWith(mockReq.body, mockReq.user);
      expect(mockRes.data).toEqual(mockReport);
      expect(mockRes.message).toBe('Customer report generated successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during customer report generation', async () => {
      const errorMessage = 'Error generating customer report';
      reportService.generateCustomerReport.mockRejectedValue(new Error(errorMessage));

      await generateCustomerReport(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('An error occurred while generating the report');
    });
  });
});
