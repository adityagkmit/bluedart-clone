const {
  createPayment,
  completeCODPayment,
  getPaymentById,
  getPayments,
} = require('../../../src/services/payments.service');
const { Payment, Shipment, sequelize } = require('../../../src/models');
const statusService = require('../../../src/services/statuses.service');
const { sendPaymentConfirmationEmail } = require('../../../src/helpers/email.helper');
const { ApiError } = require('../../../src/helpers/response.helper');
const { Op } = require('sequelize');

jest.mock('../../../src/models', () => ({
  Payment: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    rawAttributes: { status: {}, method: {}, amount: {} },
  },
  Shipment: {
    findByPk: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
    }),
  },
}));

jest.mock('../../../src/services/statuses.service', () => ({
  createStatus: jest.fn(),
}));

jest.mock('../../../src/helpers/email.helper', () => ({
  sendPaymentConfirmationEmail: jest.fn(),
}));

describe('Payments Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create a payment for a shipment successfully (Online Payment)', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const mockShipment = { id: 'shipment1', user_id: 'user1', price: 100 };
      Shipment.findByPk.mockResolvedValue(mockShipment);

      Payment.findOne.mockResolvedValue(null);

      const mockPayment = { save: jest.fn(), method: 'Online', status: 'Pending' };
      Payment.create.mockResolvedValue(mockPayment);

      const mockUser = { id: 'user1', name: 'John Doe', email: 'john.doe@example.com', Roles: [] };
      const paymentData = { shipment_id: 'shipment1', method: 'Online' };

      const result = await createPayment(paymentData, mockUser);

      expect(Shipment.findByPk).toHaveBeenCalledWith('shipment1', { transaction: mockTransaction });
      expect(Payment.findOne).toHaveBeenCalledWith({
        where: { shipment_id: 'shipment1' },
        transaction: mockTransaction,
      });
      expect(Payment.create).toHaveBeenCalledWith(
        {
          shipment_id: 'shipment1',
          user_id: 'user1',
          amount: 100,
          method: 'Online',
          status: 'Pending',
        },
        { transaction: mockTransaction }
      );
      expect(mockPayment.save).toHaveBeenCalled();
      expect(statusService.createStatus).toHaveBeenCalledWith(
        { shipment_id: 'shipment1', name: 'In Transit' },
        mockUser,
        mockTransaction
      );
      expect(sendPaymentConfirmationEmail).toHaveBeenCalledWith('john.doe@example.com', {
        userName: 'John Doe',
        shipmentId: 'shipment1',
        amount: 100,
        method: 'Online',
        status: 'Completed',
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('should throw an error if the shipment does not exist', async () => {
      const mockTransaction = { rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      Shipment.findByPk.mockResolvedValue(null);

      const mockUser = { id: 'user1', Roles: [] };
      const paymentData = { shipment_id: 'shipment1', method: 'Online' };

      await expect(createPayment(paymentData, mockUser)).rejects.toThrow(ApiError);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw an error if a payment already exists for the shipment', async () => {
      const mockTransaction = { rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const mockShipment = { id: 'shipment1', user_id: 'user1', price: 100 };
      Shipment.findByPk.mockResolvedValue(mockShipment);

      Payment.findOne.mockResolvedValue({ id: 'payment1' });

      const mockUser = { id: 'user1', Roles: [] };
      const paymentData = { shipment_id: 'shipment1', method: 'Online' };

      await expect(createPayment(paymentData, mockUser)).rejects.toThrow(ApiError);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('completeCODPayment', () => {
    it('should complete a COD payment and mark the shipment as Delivered', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };

      sequelize.transaction.mockResolvedValue(mockTransaction);

      const mockPayment = {
        shipment_id: 'shipment1',
        method: 'COD',
        status: 'Pending',
        save: jest.fn(),
      };

      const mockShipment = {
        id: 'shipment1',
        delivery_agent_id: 'user1',
        update: jest.fn(),
      };

      Payment.findByPk.mockResolvedValue(mockPayment);
      Shipment.findByPk.mockResolvedValue(mockShipment);
      statusService.createStatus.mockResolvedValue(true);

      const mockUser = { id: 'user1', name: 'John Doe', email: 'john.doe@example.com' };

      const result = await completeCODPayment('payment1', mockUser);

      expect(Payment.findByPk).toHaveBeenCalledWith('payment1', { transaction: mockTransaction });
      expect(Shipment.findByPk).toHaveBeenCalledWith('shipment1', { transaction: mockTransaction });
      expect(mockPayment.save).toHaveBeenCalled();
      expect(statusService.createStatus).toHaveBeenCalledWith(
        { shipment_id: 'shipment1', name: 'Delivered' },
        mockUser,
        mockTransaction
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('should throw an error if the payment is not COD', async () => {
      const mockTransaction = { rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const mockPayment = { id: 'payment1', method: 'Online', status: 'Pending' };
      Payment.findByPk.mockResolvedValue(mockPayment);

      const mockUser = { id: 'agent1', Roles: [] };

      await expect(completeCODPayment('payment1', mockUser)).rejects.toThrow(ApiError);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getPaymentById', () => {
    it('should return a payment by ID', async () => {
      const mockPayment = { id: 'payment1', user_id: 'user1', Shipment: {} };
      Payment.findByPk.mockResolvedValue(mockPayment);

      const mockUser = { id: 'user1', Roles: [] };

      const result = await getPaymentById('payment1', mockUser);

      expect(Payment.findByPk).toHaveBeenCalledWith('payment1', {
        include: [{ model: Shipment, as: 'Shipment' }],
      });
      expect(result).toEqual(mockPayment);
    });

    it('should throw an error if the user is unauthorized', async () => {
      const mockPayment = { id: 'payment1', user_id: 'user2', Shipment: {} };
      Payment.findByPk.mockResolvedValue(mockPayment);

      const mockUser = { id: 'user1', Roles: [] };

      await expect(getPaymentById('payment1', mockUser)).rejects.toThrow(ApiError);
    });
  });

  describe('getPayments', () => {
    it('should return paginated payments', async () => {
      const mockPayments = { count: 20, rows: [{ id: 'payment1' }, { id: 'payment2' }] };
      Payment.findAndCountAll.mockResolvedValue(mockPayments);

      const filters = { status: 'Pending' };

      const result = await getPayments(filters, 1, 10);

      expect(Payment.findAndCountAll).toHaveBeenCalledWith({
        where: { status: { [Op.eq]: 'Pending' } },
        include: [{ model: Shipment, as: 'Shipment', attributes: ['id', 'status'] }],
        offset: 0,
        limit: 10,
        order: [['created_at', 'DESC']],
      });
      expect(result).toEqual({
        totalItems: 20,
        totalPages: 2,
        currentPage: 1,
        payments: mockPayments.rows,
      });
    });
  });
});
