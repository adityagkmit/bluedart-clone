const { getAllRoles } = require('../../../src/controllers/roles.controller');
const rolesService = require('../../../src/services/roles.service');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('../../../src/services/roles.service');

describe('Roles Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = { data: null, message: null };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test: getAllRoles
  describe('getAllRoles', () => {
    it('should retrieve all roles successfully', async () => {
      const mockRoles = [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' },
      ];
      rolesService.getAllRoles.mockResolvedValue(mockRoles);

      await getAllRoles(mockReq, mockRes, mockNext);

      expect(rolesService.getAllRoles).toHaveBeenCalled();
      expect(mockRes.data).toEqual(mockRoles);
      expect(mockRes.message).toBe('Roles retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle no roles found scenario', async () => {
      rolesService.getAllRoles.mockResolvedValue([]);

      await getAllRoles(mockReq, mockRes, mockNext);

      expect(rolesService.getAllRoles).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('No roles found');
    });

    it('should handle errors during role retrieval', async () => {
      const errorMessage = 'Database error';
      rolesService.getAllRoles.mockRejectedValue(new Error(errorMessage));

      await getAllRoles(mockReq, mockRes, mockNext);

      expect(rolesService.getAllRoles).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(errorMessage);
    });
  });
});
