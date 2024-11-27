const jwt = require('jsonwebtoken');
const { redisClient } = require('../../../src/config/redis');
const { generateToken, blacklistToken, verifyToken } = require('../../../src/helpers/jwt.helper');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
}));

jest.mock('../../../src/config/redis', () => ({
  redisClient: {
    setEx: jest.fn(),
    get: jest.fn(),
  },
}));

describe('JWT Helper', () => {
  const mockUserId = '1234';
  const mockToken = 'mock.token';
  const mockDecoded = { id: mockUserId, exp: Math.floor(Date.now() / 1000) + 3600 };

  beforeAll(() => {
    process.env.JWT_SECRET = 'mockSecret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a token successfully', () => {
      jwt.sign.mockReturnValue(mockToken);

      const token = generateToken(mockUserId);

      expect(jwt.sign).toHaveBeenCalledWith({ id: mockUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      expect(token).toBe(mockToken);
    });
  });

  describe('blacklistToken', () => {
    it('should blacklist the token and store it in Redis', async () => {
      jwt.decode.mockReturnValue(mockDecoded);
      redisClient.setEx.mockResolvedValue('OK');

      await blacklistToken(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(redisClient.setEx).toHaveBeenCalledWith(
        `blacklist_${mockToken}`,
        mockDecoded.exp - Math.floor(Date.now() / 1000),
        'blacklisted'
      );
    });

    it('should throw an error if decoding the token fails', async () => {
      jwt.decode.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(blacklistToken(mockToken)).rejects.toThrow('Invalid token');
    });
  });

  describe('verifyToken', () => {
    it('should verify the token if it is not blacklisted', async () => {
      redisClient.get.mockResolvedValue(null); // Token is not blacklisted
      jwt.verify.mockReturnValue(mockDecoded);

      const decoded = await verifyToken(mockToken);

      expect(redisClient.get).toHaveBeenCalledWith(`blacklist_${mockToken}`);
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(decoded).toEqual(mockDecoded);
    });

    it('should throw an ApiError if the token is blacklisted', async () => {
      redisClient.get.mockResolvedValue('blacklisted');

      await expect(verifyToken(mockToken)).rejects.toThrowError(new ApiError(401, 'Token is blacklisted'));
      expect(redisClient.get).toHaveBeenCalledWith(`blacklist_${mockToken}`);
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should throw an error if token verification fails', async () => {
      redisClient.get.mockResolvedValue(null); // Token is not blacklisted
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(verifyToken(mockToken)).rejects.toThrow('Invalid token');
      expect(redisClient.get).toHaveBeenCalledWith(`blacklist_${mockToken}`);
    });
  });
});
