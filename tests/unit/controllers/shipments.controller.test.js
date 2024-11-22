const {
  createShipment,
  getShipments,
  getShipmentById,
  getShipmentStatuses,
  updateShipment,
  deleteShipment,
  updateShipmentStatus,
  assignDeliveryAgent,
  rescheduleShipment,
} = require('../../../src/controllers/shipments.controller');

const { ApiError } = require('../../../src/helpers/response.helper');
const shipmentService = require('../../../src/services/shipments.service');

jest.mock('../../../src/services/shipments.service');

describe('Shipment Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { params: {}, query: {}, body: {}, user: {} };
    mockRes = { data: null, message: null, statusCode: null };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test: createShipment
  describe('createShipment', () => {
    it('should create a shipment successfully', async () => {
      const mockShipment = { id: '1', name: 'Shipment 1' };
      shipmentService.createShipment.mockResolvedValue(mockShipment);

      mockReq.body = { name: 'Shipment 1' };
      mockReq.user.id = 'user1';

      await createShipment(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockShipment);
      expect(mockRes.message).toBe('Shipment created successfully');
      expect(mockRes.statusCode).toBe(201);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during shipment creation', async () => {
      shipmentService.createShipment.mockRejectedValue(new Error('Error creating shipment'));

      await createShipment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: getShipments
  describe('getShipments', () => {
    it('should retrieve shipments successfully', async () => {
      const mockShipments = [{ id: '1' }, { id: '2' }];
      shipmentService.getShipments.mockResolvedValue(mockShipments);

      mockReq.query = { page: 1, limit: 10 };

      await getShipments(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockShipments);
      expect(mockRes.message).toBe('Shipments retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during retrieval of shipments', async () => {
      shipmentService.getShipments.mockRejectedValue(new Error('Error retrieving shipments'));

      await getShipments(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: getShipmentById
  describe('getShipmentById', () => {
    it('should retrieve a shipment by ID successfully', async () => {
      const mockShipment = { id: '1', name: 'Shipment 1' };
      shipmentService.getShipmentById.mockResolvedValue(mockShipment);

      mockReq.params.id = '1';

      await getShipmentById(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockShipment);
      expect(mockRes.message).toBe('Shipment retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when shipment is not found', async () => {
      shipmentService.getShipmentById.mockResolvedValue(null);

      mockReq.params.id = '1';

      await getShipmentById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should handle errors during retrieval', async () => {
      shipmentService.getShipmentById.mockRejectedValue(new Error('Error retrieving shipment'));

      await getShipmentById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: getShipmentStatuses
  describe('getShipmentStatuses', () => {
    it('should retrieve shipment statuses successfully', async () => {
      const mockStatuses = [{ status: 'In Transit' }, { status: 'Delivered' }];
      shipmentService.getShipmentStatuses.mockResolvedValue(mockStatuses);

      mockReq.params.id = '1';

      await getShipmentStatuses(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockStatuses);
      expect(mockRes.message).toBe('Shipment statuses retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during status retrieval', async () => {
      shipmentService.getShipmentStatuses.mockRejectedValue(new Error('Error retrieving statuses'));

      await getShipmentStatuses(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: updateShipment
  describe('updateShipment', () => {
    it('should update a shipment successfully', async () => {
      const mockUpdatedShipment = { id: '1', name: 'Updated Shipment' };
      shipmentService.updateShipment.mockResolvedValue(mockUpdatedShipment);

      mockReq.params.id = '1';
      mockReq.body = { name: 'Updated Shipment' };

      await updateShipment(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockUpdatedShipment);
      expect(mockRes.message).toBe('Shipment updated successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when updating a non-existent shipment', async () => {
      shipmentService.updateShipment.mockResolvedValue(null);

      mockReq.params.id = '1';
      mockReq.body = { name: 'Updated Shipment' };

      await updateShipment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should handle errors during update', async () => {
      shipmentService.updateShipment.mockRejectedValue(new Error('Error updating shipment'));

      await updateShipment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: deleteShipment
  describe('deleteShipment', () => {
    it('should delete a shipment successfully', async () => {
      shipmentService.deleteShipment.mockResolvedValue(true);

      mockReq.params.id = '1';

      await deleteShipment(mockReq, mockRes, mockNext);

      expect(mockRes.message).toBe('Shipment deleted successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when shipment is not found', async () => {
      shipmentService.deleteShipment.mockResolvedValue(false);

      mockReq.params.id = '1';

      await deleteShipment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should handle errors during deletion', async () => {
      shipmentService.deleteShipment.mockRejectedValue(new Error('Error deleting shipment'));

      await deleteShipment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: updateShipmentStatus
  describe('updateShipmentStatus', () => {
    it('should update the shipment status successfully', async () => {
      const mockUpdatedShipment = { id: '1', status: 'Delivered' };
      shipmentService.updateShipmentStatus.mockResolvedValue(mockUpdatedShipment);

      mockReq.params.id = '1';
      mockReq.body = { status: 'Delivered' };

      await updateShipmentStatus(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockUpdatedShipment);
      expect(mockRes.message).toBe('Shipment status updated successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when shipment is not found', async () => {
      shipmentService.updateShipmentStatus.mockResolvedValue(null);

      mockReq.params.id = '1';
      mockReq.body = { status: 'Delivered' };

      await updateShipmentStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should handle errors during shipment status update', async () => {
      shipmentService.updateShipmentStatus.mockRejectedValue(new Error('Error updating status'));

      mockReq.params.id = '1';
      mockReq.body = { status: 'Delivered' };

      await updateShipmentStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: assignDeliveryAgent
  describe('assignDeliveryAgent', () => {
    it('should assign a delivery agent successfully', async () => {
      const mockUpdatedShipment = { id: '1', deliveryAgentId: 'agent123' };
      shipmentService.assignDeliveryAgent.mockResolvedValue(mockUpdatedShipment);

      mockReq.params.id = '1';
      mockReq.body = { delivery_agent_id: 'agent123' };

      await assignDeliveryAgent(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockUpdatedShipment);
      expect(mockRes.message).toBe('Delivery agent assigned successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when shipment is not found', async () => {
      shipmentService.assignDeliveryAgent.mockResolvedValue(null);

      mockReq.params.id = '1';
      mockReq.body = { delivery_agent_id: 'agent123' };

      await assignDeliveryAgent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should handle errors during assignment', async () => {
      shipmentService.assignDeliveryAgent.mockRejectedValue(new Error('Error assigning agent'));

      mockReq.params.id = '1';
      mockReq.body = { delivery_agent_id: 'agent123' };

      await assignDeliveryAgent(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: rescheduleShipment
  describe('rescheduleShipment', () => {
    it('should reschedule a shipment successfully', async () => {
      const mockUpdatedShipment = { id: '1', preferredDeliveryDate: '2024-12-01' };
      shipmentService.rescheduleShipment.mockResolvedValue(mockUpdatedShipment);

      mockReq.params.id = '1';
      mockReq.body = {
        preferred_delivery_date: '2024-12-01',
        preferred_delivery_time: '10:00 AM',
      };
      mockReq.user = {
        id: 'user1',
        Roles: [{ name: 'Customer' }],
      };

      await rescheduleShipment(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockUpdatedShipment);
      expect(mockRes.message).toBe('Delivery rescheduled successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when shipment is not found', async () => {
      shipmentService.rescheduleShipment.mockResolvedValue(null);

      mockReq.params.id = '1';
      mockReq.body = {
        preferred_delivery_date: '2024-12-01',
        preferred_delivery_time: '10:00 AM',
      };
      mockReq.user = {
        id: 'user1',
        Roles: [{ name: 'Customer' }],
      };

      await rescheduleShipment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should handle errors during rescheduling', async () => {
      shipmentService.rescheduleShipment.mockRejectedValue(new Error('Error rescheduling shipment'));

      mockReq.params.id = '1';
      mockReq.body = {
        preferred_delivery_date: '2024-12-01',
        preferred_delivery_time: '10:00 AM',
      };
      mockReq.user = {
        id: 'user1',
        Roles: [{ name: 'Customer' }],
      };

      await rescheduleShipment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });
});
