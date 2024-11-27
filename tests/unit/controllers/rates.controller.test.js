const { getAllRates } = require('../../../src/controllers/rates.controller');
const ratesService = require('../../../src/services/rates.service');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('../../../src/services/rates.service');

describe('Rates Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = { data: null, message: null };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test: getAllRates
  describe('getAllRates', () => {
    it('should retrieve all rates successfully', async () => {
      const mockRates = [
        { id: 1, name: 'Rate A', value: 100 },
        { id: 2, name: 'Rate B', value: 200 },
      ];
      ratesService.getAllRates.mockResolvedValue(mockRates);

      await getAllRates(mockReq, mockRes, mockNext);

      expect(ratesService.getAllRates).toHaveBeenCalled();
      expect(mockRes.data).toEqual(mockRates);
      expect(mockRes.message).toBe('Rates retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle no rates found scenario', async () => {
      ratesService.getAllRates.mockResolvedValue([]);

      await getAllRates(mockReq, mockRes, mockNext);

      expect(ratesService.getAllRates).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('No rates found.');
    });

    it('should handle errors during rate retrieval', async () => {
      const errorMessage = 'Service error';
      ratesService.getAllRates.mockRejectedValue(new Error(errorMessage));

      await getAllRates(mockReq, mockRes, mockNext);

      expect(ratesService.getAllRates).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(errorMessage);
    });
  });
});
