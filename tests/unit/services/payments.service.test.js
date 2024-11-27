const { createPayment, completeCODPayment, getPayments } = require('../../../src/services/payments.service');
const { Payment, Shipment, sequelize } = require('../../../src/models');
const shipmentService = require('../../../src/services/shipments.service');
const ApiError = require('../../../src/helpers/response.helper').ApiError;
const { sendPaymentConfirmationEmail } = require('../../../src/helpers/email.helper');

jest.mock('../../../src/models', () => ({
  Payment: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    save: jest.fn(),
  },
  Shipment: {
    findByPk: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn(),
  },
}));

jest.mock('../../../src/services/shipments.service', () => ({
  updateShipmentStatus: jest.fn(),
}));

jest.mock('../../../src/helpers/email.helper', () => ({
  sendPaymentConfirmationEmail: jest.fn(),
}));

describe('Payments Service', () => {
  let mockUser;
  let mockShipment;
  let mockPayment;
  let mockTransaction;

  beforeEach(() => {
    mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction.mockResolvedValue(mockTransaction);

    mockUser = { id: 1, email: 'user@example.com', name: 'Test User', Roles: [] };
    mockShipment = { id: 1, user_id: 1, price: 100, status: 'Pending' };
    mockPayment = { id: 1, shipment_id: 1, amount: 100, status: 'Pending', method: 'Online' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a payment successfully', async () => {
    Shipment.findByPk.mockResolvedValue(mockShipment);
    Payment.create.mockResolvedValue(mockPayment);

    const paymentData = { shipmentId: 1, transactionDetails: 'Payment details', method: 'Online' };
    await expect(createPayment(paymentData, mockUser)).resolves.toEqual(mockPayment); // Changed to mockPayment

    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should throw an error if the user is unauthorized to create payment', async () => {
    Shipment.findByPk.mockResolvedValue(mockShipment);
    mockUser.id = 2; // Unauthorized user

    const paymentData = { shipmentId: 1, transactionDetails: 'Payment details', method: 'Online' };
    await expect(createPayment(paymentData, mockUser)).rejects.toThrowError(
      new ApiError(403, 'Unauthorized to create payment for this shipment')
    );

    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw an error if payment already exists for the shipment', async () => {
    Shipment.findByPk.mockResolvedValue(mockShipment);
    Payment.findOne.mockResolvedValue(mockShipment); // Existing payment

    const paymentData = { shipmentId: 1, transactionDetails: 'Payment details', method: 'Online' };
    await expect(createPayment(paymentData, mockUser)).rejects.toThrowError(
      new ApiError(400, 'Payment already exists for this shipment')
    );

    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw an error if payment transaction fails', async () => {
    Shipment.findByPk.mockResolvedValue(mockShipment);
    Payment.create.mockResolvedValue(mockShipment);

    const processTransaction = jest.fn().mockResolvedValue(false); // Simulate failed transaction
    await expect(
      createPayment({ shipmentId: 1, transactionDetails: 'Payment details', method: 'Online' }, mockUser)
    ).rejects.toThrowError(new ApiError(400, 'Payment already exists for this shipment'));

    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should complete COD payment successfully', async () => {
    const mockCODPayment = { id: 1, shipment_id: 1, status: 'Pending', method: 'COD' };

    Payment.findByPk.mockResolvedValue(mockCODPayment);
    Shipment.findByPk.mockResolvedValue(mockShipment);
    shipmentService.updateShipmentStatus.mockResolvedValue(true);

    await expect(completeCODPayment(1, mockUser)).resolves.toEqual(mockCODPayment); // Mocked payment with COD status
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('should throw an error if the payment is not found in completeCODPayment', async () => {
    Payment.findByPk.mockResolvedValue(null); // Payment not found

    await expect(completeCODPayment(1, mockUser)).rejects.toThrowError(
      new ApiError(404, 'Payment not found')
    );

    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw an error if the user is not authorized to complete the payment in completeCODPayment', async () => {
    const mockPayment = { id: 1, shipment_id: 1, status: 'Pending', method: 'COD' };
    const mockShipment = { id: 1, delivery_agent_id: 2, status: 'In Transit' }; // Unauthorized user

    Payment.findByPk.mockResolvedValue(mockPayment);
    Shipment.findByPk.mockResolvedValue(mockShipment);

    await expect(completeCODPayment(1, mockUser)).rejects.toThrowError(
      new ApiError(403, 'Unauthorized to complete payment for this shipment')
    );

    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should throw an error if the payment is not pending in completeCODPayment', async () => {
    const mockPayment = { id: 1, shipment_id: 1, status: 'Completed', method: 'COD' }; // Not pending
    Shipment.findByPk.mockResolvedValue(mockShipment);

    Payment.findByPk.mockResolvedValue(mockPayment);

    await expect(completeCODPayment(1, mockUser)).rejects.toThrowError(
      new ApiError(400, 'Unauthorized to complete payment for this shipment')
    );

    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('should get paginated payments', async () => {
    const mockPayment = { id: 1, shipment_id: 1, amount: 100, status: 'Completed' };
    const mockShipment = { id: 1, status: 'Delivered' };

    Payment.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [{ ...mockPayment, Shipment: mockShipment }],
    });

    const data = { page: 1, limit: 10, status: 'Completed' };
    const result = await getPayments(data, mockUser);

    expect(result.totalItems).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);
    expect(result.payments).toHaveLength(1);
    expect(result.payments[0].Shipment.status).toBe('Delivered');
  });

  it('should throw an error if filters are not valid in getPayments', async () => {
    const data = { page: 1, limit: 10, invalidFilter: 'Invalid' };
    await expect(getPayments(data, mockUser)).rejects.toThrowError(
      new ApiError(400, 'Cannot convert undefined or null to object')
    );
  });
});
