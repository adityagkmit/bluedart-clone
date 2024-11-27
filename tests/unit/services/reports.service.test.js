const { generateShipmentReport, generateCustomerReport } = require('../../../src/services/reports.service');
const { Shipment, User, Status, Report } = require('../../../src/models');
const { uploadFileToS3 } = require('../../../src/helpers/aws.helper');
const { createShipmentPdf, createCustomerPdf } = require('../../../src/helpers/pdf.helper');
const { ApiError } = require('../../../src/helpers/response.helper');
const { Op } = require('sequelize');

jest.mock('../../../src/models', () => ({
  Shipment: {
    findAll: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
  Status: {
    findByPk: jest.fn(),
  },
  Report: {
    create: jest.fn(),
  },
}));

jest.mock('../../../src/helpers/aws.helper', () => ({
  uploadFileToS3: jest.fn(),
}));

jest.mock('../../../src/helpers/pdf.helper', () => ({
  createShipmentPdf: jest.fn(),
  createCustomerPdf: jest.fn(),
}));

describe('Reports Service', () => {
  let mockUser;
  let mockShipments;

  beforeEach(() => {
    mockUser = { id: 1, roles: ['Customer'] };

    mockShipments = [
      {
        id: 1,
        status: 'Delivered',
        price: 100,
        user_id: 1,
        created_at: '2024-11-01',
        destination: 'Location 1',
        user: { name: 'Test User', email: 'test@example.com' },
        statuses: [{ name: 'Delivered' }],
      },
      {
        id: 2,
        status: 'In Transit',
        price: 50,
        user_id: 1,
        created_at: '2024-11-02',
        destination: 'Location 2',
        user: { name: 'Test User', email: 'test@example.com' },
        statuses: [{ name: 'In Transit' }],
      },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a shipment report successfully', async () => {
    Shipment.findAll.mockResolvedValue(mockShipments);
    createShipmentPdf.mockResolvedValue('/path/to/shipment_report.pdf');
    uploadFileToS3.mockResolvedValue('https://s3.amazonaws.com/shipments/report.pdf');
    Report.create.mockResolvedValue();

    const filters = { status: 'Delivered', startDate: '2024-11-01', endDate: '2024-11-02' };
    const result = await generateShipmentReport(filters, mockUser);

    expect(result).toEqual({
      url: 'https://s3.amazonaws.com/shipments/report.pdf',
      metadata: expect.objectContaining({
        totalShipments: 2,
        successfulDeliveries: 1,
        inTransit: 1,
        pendingShipments: 0,
        totalValue: 150,
        filtersApplied: filters,
        reportGeneratedForRoles: ['Customer'],
      }),
    });
    expect(createShipmentPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Shipment Report',
        content: expect.any(Array),
        metadata: expect.any(Array),
      }),
      expect.any(String)
    );
    expect(uploadFileToS3).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/path/to/shipment_report.pdf',
        originalname: 'shipment_report_1637734939329.pdf',
        mimetype: 'application/pdf',
      }),
      expect.any(String)
    );
    expect(Report.create).toHaveBeenCalledWith({
      user_id: 1,
      url: 'https://s3.amazonaws.com/shipments/report.pdf',
    });
  });

  it('should throw error if no shipments are found in generateShipmentReport', async () => {
    Shipment.findAll.mockResolvedValue([]);

    const filters = { status: 'Delivered' };
    await expect(generateShipmentReport(filters, mockUser)).rejects.toThrowError(
      new ApiError(404, 'Cannot convert undefined or null to object')
    );
  });

  it('should generate a customer report successfully', async () => {
    Shipment.findAll.mockResolvedValue(mockShipments);
    createCustomerPdf.mockResolvedValue('/path/to/customer_report.pdf');
    uploadFileToS3.mockResolvedValue('https://s3.amazonaws.com/customers/report.pdf');
    Report.create.mockResolvedValue();

    const filters = { startDate: '2024-11-01', endDate: '2024-11-02', maxPrice: 100 };
    const result = await generateCustomerReport(filters, mockUser);

    expect(result).toEqual({
      url: 'https://s3.amazonaws.com/customers/report.pdf',
      metadata: expect.any(Array),
    });

    expect(createCustomerPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Customer Report',
        content: expect.any(Array),
        metadata: expect.any(Array),
      }),
      expect.any(String)
    );
    expect(uploadFileToS3).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/path/to/customer_report.pdf',
        originalname: 'customer_report_1637734939329.pdf',
        mimetype: 'application/pdf',
      }),
      expect.any(String)
    );
    expect(Report.create).toHaveBeenCalledWith({
      user_id: 1,
      url: 'https://s3.amazonaws.com/customers/report.pdf',
      type: 'Customer Report',
    });
  });

  it('should throw error if no shipments are found in generateCustomerReport', async () => {
    Shipment.findAll.mockResolvedValue([]);

    const filters = { startDate: '2024-11-01', endDate: '2024-11-02' };
    await expect(generateCustomerReport(filters, mockUser)).rejects.toThrowError(
      new ApiError(404, 'Cannot convert undefined or null to object')
    );
  });

  it('should throw error if filters are invalid in generateCustomerReport', async () => {
    const filters = { invalidFilter: 'Invalid' };
    await expect(generateCustomerReport(filters, mockUser)).rejects.toThrowError(
      new ApiError(400, 'Cannot convert undefined or null to object')
    );
  });
});
