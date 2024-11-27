const { getStatusById } = require('../../../src/controllers/statuses.controller');
const statusService = require('../../../src/services/statuses.service');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('../../../src/services/statuses.service');

describe('Status Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { params: {}, user: {} };
    mockRes = { data: null, message: null, statusCode: null };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatusById', () => {
    it('should retrieve a status successfully', async () => {
      const mockStatus = { id: '123', name: 'Active' };
      statusService.getStatusById.mockResolvedValue(mockStatus);

      mockReq.params.id = '123';
      mockReq.user = { id: 'user123' };

      await getStatusById(mockReq, mockRes, mockNext);

      expect(statusService.getStatusById).toHaveBeenCalledWith(mockReq.params, mockReq.user);
      expect(mockRes.data).toEqual(mockStatus);
      expect(mockRes.message).toBe('Status retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when the status is not found', async () => {
      statusService.getStatusById.mockResolvedValue(null);

      mockReq.params.id = '123';
      mockReq.user = { id: 'user123' };

      await getStatusById(mockReq, mockRes, mockNext);

      expect(statusService.getStatusById).toHaveBeenCalledWith(mockReq.params, mockReq.user);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Status not found');
    });

    it('should handle unexpected errors', async () => {
      const errorMessage = 'Database error';
      statusService.getStatusById.mockRejectedValue(new Error(errorMessage));

      mockReq.params.id = '123';
      mockReq.user = { id: 'user123' };

      await getStatusById(mockReq, mockRes, mockNext);

      expect(statusService.getStatusById).toHaveBeenCalledWith(mockReq.params, mockReq.user);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(errorMessage);
    });
  });
});
