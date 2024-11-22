const { createStatus, getStatusById, deleteStatus } = require('../../../src/controllers/statuses.controller');
const statusService = require('../../../src/services/statuses.service');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('../../../src/services/statuses.service');

describe('Statuses Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      params: {},
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

  // Test: createStatus
  describe('createStatus', () => {
    it('should create a status successfully', async () => {
      const mockStatus = { id: '1', name: 'In Progress' };
      statusService.createStatus.mockResolvedValue(mockStatus);

      mockReq.body = { name: 'In Progress' };
      mockReq.user = { id: 'user1' };

      await createStatus(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockStatus);
      expect(mockRes.message).toBe('Status created successfully');
      expect(mockRes.statusCode).toBe(201);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during status creation', async () => {
      statusService.createStatus.mockRejectedValue(new Error('Error creating status'));

      mockReq.body = { name: 'In Progress' };
      mockReq.user = { id: 'user1' };

      await createStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: getStatusById
  describe('getStatusById', () => {
    it('should retrieve a status successfully', async () => {
      const mockStatus = { id: '1', name: 'Completed' };
      statusService.getStatusById.mockResolvedValue(mockStatus);

      mockReq.params.id = '1';

      await getStatusById(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockStatus);
      expect(mockRes.message).toBe('Status retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when status is not found', async () => {
      statusService.getStatusById.mockResolvedValue(null);

      mockReq.params.id = '1';

      await getStatusById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should handle errors during status retrieval', async () => {
      statusService.getStatusById.mockRejectedValue(new Error('Error retrieving status'));

      mockReq.params.id = '1';

      await getStatusById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: deleteStatus
  describe('deleteStatus', () => {
    it('should delete a status successfully', async () => {
      statusService.deleteStatus.mockResolvedValue();

      mockReq.params.id = '1';
      mockReq.user = { id: 'user1' };

      await deleteStatus(mockReq, mockRes, mockNext);

      expect(mockRes.data).toBeNull();
      expect(mockRes.message).toBe('Status deleted successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during status deletion', async () => {
      statusService.deleteStatus.mockRejectedValue(new Error('Error deleting status'));

      mockReq.params.id = '1';
      mockReq.user = { id: 'user1' };

      await deleteStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });
});
