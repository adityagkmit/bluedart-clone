const { generateShipmentReport, generateCustomerReport } = require('../../../src/services/reports.service');
const { Shipment, User, Status, Report } = require('../../../src/models');
const { uploadFileToS3 } = require('../../../src/helpers/aws.helper');
const { createShipmentPdf, createCustomerPdf } = require('../../../src/helpers/pdf.helper');
const { ApiError } = require('../../../src/helpers/response.helper');
const { Op } = require('sequelize');

jest.mock('../../../src/models');
jest.mock('../../../src/helpers/aws.helper');
jest.mock('../../../src/helpers/pdf.helper');

describe('Reports Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateShipmentReport', () => {
    it('should generate a shipment report successfully', async () => {
      const filters = { status: 'Delivered' };
      const userId = 'user1';
      const roles = ['Admin'];

      Shipment.findAll.mockResolvedValue([
        {
          id: 1,
          status: 'Delivered',
          price: 500,
          user: { name: 'John', email: 'john@example.com' },
          created_at: new Date(),
        },
        {
          id: 2,
          status: 'In Transit',
          price: 300,
          user: { name: 'Jane', email: 'jane@example.com' },
          created_at: new Date(),
        },
      ]);

      createShipmentPdf.mockResolvedValue('/path/to/shipment_report.pdf');
      uploadFileToS3.mockResolvedValue('https://s3.amazonaws.com/reports/shipment_report.pdf');
      Report.create.mockResolvedValue();

      const result = await generateShipmentReport(filters, userId, roles);

      expect(Shipment.findAll).toHaveBeenCalledWith(expect.any(Object));
      expect(createShipmentPdf).toHaveBeenCalledWith(
        expect.any(Object),
        expect.stringContaining('shipment_report')
      );
      expect(uploadFileToS3).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/path/to/shipment_report.pdf' }),
        expect.stringContaining('shipment_report')
      );
      expect(Report.create).toHaveBeenCalledWith(expect.any(Object));
      expect(result.url).toBe('https://s3.amazonaws.com/reports/shipment_report.pdf');
    });

    it('should throw an error if no shipments match the filters', async () => {
      Shipment.findAll.mockResolvedValue([]);

      await expect(generateShipmentReport({}, 'user1', ['Admin'])).rejects.toThrow(
        new ApiError(404, 'No shipments found for the given filters.')
      );

      expect(Shipment.findAll).toHaveBeenCalled();
      expect(createShipmentPdf).not.toHaveBeenCalled();
      expect(uploadFileToS3).not.toHaveBeenCalled();
    });
  });

  describe('generateCustomerReport', () => {
    it('should generate a customer report successfully', async () => {
      const filters = { maxPrice: 1000 };
      const userId = 'user1';

      Shipment.findAll.mockResolvedValue([
        {
          id: 1,
          price: 500,
          status: 'Delivered',
          destination: 'NYC',
          created_at: new Date(),
          user: { name: 'John', email: 'john@example.com' },
        },
        {
          id: 2,
          price: 300,
          status: 'In Transit',
          destination: 'LAX',
          created_at: new Date(),
          user: { name: 'Jane', email: 'jane@example.com' },
        },
      ]);

      createCustomerPdf.mockResolvedValue('/path/to/customer_report.pdf');
      uploadFileToS3.mockResolvedValue('https://s3.amazonaws.com/reports/customer_report.pdf');
      Report.create.mockResolvedValue();

      const result = await generateCustomerReport(filters, userId);

      expect(Shipment.findAll).toHaveBeenCalledWith(expect.any(Object));
      expect(createCustomerPdf).toHaveBeenCalledWith(
        expect.any(Object),
        expect.stringContaining('customer_report')
      );
      expect(uploadFileToS3).toHaveBeenCalledWith(
        expect.objectContaining({ path: '/path/to/customer_report.pdf' }),
        expect.stringContaining('customer_report')
      );
      expect(Report.create).toHaveBeenCalledWith(expect.any(Object));
      expect(result.url).toBe('https://s3.amazonaws.com/reports/customer_report.pdf');
    });

    it('should throw an error if no shipments match the filters', async () => {
      Shipment.findAll.mockResolvedValue([]);

      await expect(generateCustomerReport({}, 'user1')).rejects.toThrow(
        new ApiError(404, 'No shipments found for the given period.')
      );

      expect(Shipment.findAll).toHaveBeenCalled();
      expect(createCustomerPdf).not.toHaveBeenCalled();
      expect(uploadFileToS3).not.toHaveBeenCalled();
    });
  });
});
