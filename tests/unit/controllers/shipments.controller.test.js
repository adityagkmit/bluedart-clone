const {
  createShipment,
  getShipments,
  getShipmentById,
  getShipmentStatuses,
  updateShipment,
  deleteShipment,
  updateShipmentThroughAction,
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
      const mockShipment = { id: '1', name: 'New Shipment' };
      shipmentService.createShipment.mockResolvedValue(mockShipment);

      mockReq.body = { name: 'New Shipment' };
      mockReq.user.id = 'user123';

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

    it('should handle errors during retrieval', async () => {
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

      await deleteShipment(mockReq, mockRes, mockNext);

      expect(mockRes.message).toBe('Shipment deleted successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when shipment is not found', async () => {
      shipmentService.deleteShipment.mockResolvedValue(false);

      await deleteShipment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should handle errors during deletion', async () => {
      shipmentService.deleteShipment.mockRejectedValue(new Error('Error deleting shipment'));

      await deleteShipment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: updateShipmentThroughAction
  describe('updateShipmentThroughAction', () => {
    it('should perform an action on a shipment successfully', async () => {
      const mockResult = {
        shipment: { id: '1', status: 'Delivered' },
        message: 'Action performed successfully',
      };
      shipmentService.performActionOnShipment.mockResolvedValue(mockResult);

      await updateShipmentThroughAction(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockResult.shipment);
      expect(mockRes.message).toBe(mockResult.message);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when action fails', async () => {
      shipmentService.performActionOnShipment.mockRejectedValue(new Error('Error performing action'));

      await updateShipmentThroughAction(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });
});
