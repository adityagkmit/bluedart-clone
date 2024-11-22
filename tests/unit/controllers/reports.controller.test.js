const {
  generateShipmentReport,
  generateCustomerReport,
} = require('../../../src/controllers/reports.controller');
const reportService = require('../../../src/services/reports.service');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('../../../src/services/reports.service');

describe('Reports Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: {},
    };

    mockRes = {
      data: null,
      message: '',
      statusCode: 200,
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test: generateShipmentReport
  describe('generateShipmentReport', () => {
    it('should generate a shipment report successfully', async () => {
      const mockReport = { id: '123', title: 'Shipment Report' };
      reportService.generateShipmentReport.mockResolvedValue(mockReport);

      mockReq.body = { dateRange: 'last-month' };
      mockReq.user = { id: 'user1', roles: ['admin'] };

      await generateShipmentReport(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockReport);
      expect(mockRes.message).toBe('Shipment report generated successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during shipment report generation', async () => {
      reportService.generateShipmentReport.mockRejectedValue(new Error('Error generating shipment report'));

      mockReq.body = { dateRange: 'last-month' };
      mockReq.user = { id: 'user1', roles: ['admin'] };

      await generateShipmentReport(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: generateCustomerReport
  describe('generateCustomerReport', () => {
    it('should generate a customer report successfully', async () => {
      const mockReport = { id: '456', title: 'Customer Report' };
      reportService.generateCustomerReport.mockResolvedValue(mockReport);

      mockReq.body = { customerId: 'cust123' };
      mockReq.user = { id: 'user2' };

      await generateCustomerReport(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockReport);
      expect(mockRes.message).toBe('Customer report generated successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during customer report generation', async () => {
      reportService.generateCustomerReport.mockRejectedValue(new Error('Error generating customer report'));

      mockReq.body = { customerId: 'cust123' };
      mockReq.user = { id: 'user2' };

      await generateCustomerReport(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });
});
