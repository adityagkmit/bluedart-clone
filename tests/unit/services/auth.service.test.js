const { sendOtp, verifyOtp, registerUser, loginUser, logout } = require('../../../src/services/auth.service');
const { redisClient } = require('../../../src//config/redis');
const { sendOtpEmail } = require('../../../src//helpers/email.helper');
const { generateToken, blacklistToken } = require('../../../src/helpers/jwt.helper');
const { User } = require('../../../src/models');
const userService = require('../../../src/services/users.service');
const { ApiError } = require('../../../src/helpers/response.helper');
const bcrypt = require('bcryptjs');

// Mocking dependencies
jest.mock('../../../src//config/redis', () => ({
  redisClient: {
    setEx: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
}));
jest.mock('../../../src//helpers/email.helper', () => ({
  sendOtpEmail: jest.fn(),
}));
jest.mock('../../../src//helpers/jwt.helper', () => ({
  generateToken: jest.fn(),
  blacklistToken: jest.fn(),
}));
jest.mock('../../../src//models', () => ({
  User: {
    findOne: jest.fn(),
  },
}));
jest.mock('../../../src//services/users.service', () => ({
  createUser: jest.fn(),
}));

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('should generate and send OTP successfully', async () => {
      redisClient.setEx.mockResolvedValue();
      sendOtpEmail.mockResolvedValue();

      const result = await sendOtp('test@example.com');

      expect(redisClient.setEx).toHaveBeenCalledWith('test@example.com', 300, expect.any(String));
      expect(sendOtpEmail).toHaveBeenCalledWith('test@example.com', expect.any(String));
      expect(result).toEqual({ message: 'OTP sent to email' });
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      redisClient.get.mockResolvedValue('123456');
      redisClient.del.mockResolvedValue();
      redisClient.setEx.mockResolvedValue();

      const result = await verifyOtp({ email: 'test@example.com', otp: '123456' });

      expect(redisClient.get).toHaveBeenCalledWith('test@example.com');
      expect(redisClient.del).toHaveBeenCalledWith('test@example.com');
      expect(redisClient.setEx).toHaveBeenCalledWith('test@example.com_verified', 300, 'true');
      expect(result).toBe(true);
    });

    it('should throw error for invalid OTP', async () => {
      redisClient.get.mockResolvedValue(null);

      await expect(verifyOtp({ email: 'test@example.com', otp: '123456' })).rejects.toThrow(ApiError);
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      redisClient.get.mockResolvedValue('true');
      userService.createUser.mockResolvedValue({ id: 1, email: 'test@example.com' });

      const payload = { email: 'test@example.com', password: 'Password123!' };
      const result = await registerUser(payload);

      expect(redisClient.get).toHaveBeenCalledWith('test@example.com_verified');
      expect(userService.createUser).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ id: 1, email: 'test@example.com' });
    });

    it('should throw error if OTP is not verified', async () => {
      redisClient.get.mockResolvedValue(null);

      const payload = { email: 'test@example.com', password: 'Password123!' };
      await expect(registerUser(payload)).rejects.toThrow(ApiError);
    });
  });

  describe('loginUser', () => {
    it('should log in user successfully', async () => {
      User.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', 10),
      });
      generateToken.mockReturnValue('mockToken');

      const result = await loginUser({ email: 'test@example.com', password: 'Password123!' });

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual({
        user: expect.any(Object),
        token: 'mockToken',
      });
    });

    it('should throw error for invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(loginUser({ email: 'test@example.com', password: 'WrongPassword' })).rejects.toThrow(
        ApiError
      );
    });
  });

  describe('logout', () => {
    it('should blacklist token successfully', async () => {
      blacklistToken.mockResolvedValue();

      await logout('mockToken');

      expect(blacklistToken).toHaveBeenCalledWith('mockToken');
    });
  });
});
