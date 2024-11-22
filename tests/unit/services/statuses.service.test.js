const { createStatus, getStatusById, deleteStatus } = require('../../../src/services/statuses.service');
const { Status, Shipment } = require('../../../src/models');
const { sendShipmentStatusUpdateEmail } = require('../../../src/helpers/email.helper');
const { ApiError } = require('../../../src/helpers/response.helper');
const { Op } = require('sequelize');

jest.mock('../../../src/models', () => ({
  Status: {
    findByPk: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  },
  Shipment: {
    findByPk: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../../src/helpers/email.helper', () => ({
  sendShipmentStatusUpdateEmail: jest.fn(),
}));

describe('Statuses Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStatus', () => {
    it('should create a status successfully', async () => {
      const mockShipment = {
        id: 'shipment1',
        delivery_agent_id: 'agent1',
        user_id: 'user1',
        update: jest.fn(),
      };
      Shipment.findByPk.mockResolvedValue(mockShipment);

      const mockStatus = { id: 'status1', name: 'In Progress' };
      Status.create.mockResolvedValue(mockStatus);

      const mockUser = { id: 'user1', name: 'John Doe', email: 'john.doe@example.com', Roles: [] };

      const data = { shipment_id: 'shipment1', name: 'In Progress' };

      const result = await createStatus(data, mockUser);

      expect(Shipment.findByPk).toHaveBeenCalledWith('shipment1', { transaction: null });
      expect(Status.create).toHaveBeenCalledWith(data, { transaction: null });
      expect(mockShipment.update).toHaveBeenCalledWith({ status: 'In Progress' }, { transaction: null });
      expect(sendShipmentStatusUpdateEmail).toHaveBeenCalledWith('john.doe@example.com', {
        userName: 'John Doe',
        shipmentId: 'shipment1',
        status: 'In Progress',
      });
      expect(result).toEqual(mockStatus);
    });

    it('should throw an error if the shipment is not found', async () => {
      Shipment.findByPk.mockResolvedValue(null);

      const mockUser = { id: 'user1', Roles: [] };
      const data = { shipment_id: 'shipment1', name: 'In Progress' };

      await expect(createStatus(data, mockUser)).rejects.toThrow(ApiError);
      expect(Shipment.findByPk).toHaveBeenCalledWith('shipment1', { transaction: null });
    });

    it('should throw an error if the user is not authorized', async () => {
      const mockShipment = { id: 'shipment1', delivery_agent_id: 'agent1', user_id: 'user2' };
      Shipment.findByPk.mockResolvedValue(mockShipment);

      const mockUser = { id: 'user1', Roles: [] };
      const data = { shipment_id: 'shipment1', name: 'In Progress' };

      await expect(createStatus(data, mockUser)).rejects.toThrow(ApiError);
    });
  });

  describe('getStatusById', () => {
    it('should retrieve a status by ID', async () => {
      const mockStatus = { id: 'status1', name: 'In Progress' };
      Status.findByPk.mockResolvedValue(mockStatus);

      const result = await getStatusById('status1');

      expect(Status.findByPk).toHaveBeenCalledWith('status1');
      expect(result).toEqual(mockStatus);
    });
  });

  describe('deleteStatus', () => {
    it('should delete a status and update the shipment status', async () => {
      const mockShipment = {
        id: 'shipment1',
        status: 'In Progress',
        delivery_agent_id: 'agent1',
        update: jest.fn(),
      };

      const mockStatus = {
        id: 'status1',
        name: 'In Progress',
        Shipment: mockShipment,
        created_at: new Date(),
        destroy: jest.fn(),
      };

      const previousStatus = { name: 'Pending' };
      Status.findByPk.mockResolvedValue(mockStatus);
      Status.findOne.mockResolvedValue(previousStatus);

      const mockUser = { id: 'agent1', Roles: [] };

      const result = await deleteStatus('status1', mockUser);

      expect(Status.findByPk).toHaveBeenCalledWith('status1', { include: { model: Shipment } });
      expect(mockShipment.update).toHaveBeenCalledWith({ status: 'Pending' });
      expect(mockStatus.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw an error if the status is not found', async () => {
      Status.findByPk.mockResolvedValue(null);

      const mockUser = { id: 'user1', Roles: [] };

      await expect(deleteStatus('status1', mockUser)).rejects.toThrow(ApiError);
    });

    it('should throw an error if the user is not authorized to delete the status', async () => {
      const mockShipment = {
        id: 'shipment1',
        delivery_agent_id: 'agent1',
      };

      const mockStatus = { id: 'status1', Shipment: mockShipment };
      Status.findByPk.mockResolvedValue(mockStatus);

      const mockUser = { id: 'user2', Roles: [] };

      await expect(deleteStatus('status1', mockUser)).rejects.toThrow(ApiError);
    });
  });
});
