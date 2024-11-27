const { register, sendOtp, verifyOtp, login, logout } = require('../../../src/controllers/auth.controller');
const authService = require('../../../src/services/auth.service');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('../../../src/services/auth.service');

describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      headers: {},
    };
    mockRes = {
      data: null,
      message: null,
      statusCode: null,
    };
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should register a user and call next()', async () => {
      const user = { id: 1, email: 'test@example.com' };
      authService.registerUser.mockResolvedValue(user);

      mockReq.body = { email: 'test@example.com', password: 'password123' };

      await register(mockReq, mockRes, mockNext);

      expect(authService.registerUser).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.data).toEqual(user);
      expect(mockRes.message).toBe('User registered successfully');
      expect(mockRes.statusCode).toBe(201);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Registration failed');
      authService.registerUser.mockRejectedValue(error);

      await register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, error.message));
    });
  });

  describe('sendOtp', () => {
    it('should send OTP and call next()', async () => {
      authService.sendOtp.mockResolvedValue();

      mockReq.body.email = 'test@example.com';

      await sendOtp(mockReq, mockRes, mockNext);

      expect(authService.sendOtp).toHaveBeenCalledWith(mockReq.body.email);
      expect(mockRes.message).toBe('OTP sent successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Failed to send OTP');
      authService.sendOtp.mockRejectedValue(error);

      await sendOtp(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, error.message));
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and call next()', async () => {
      authService.verifyOtp.mockResolvedValue();

      mockReq.body = { email: 'test@example.com', otp: '123456' };

      await verifyOtp(mockReq, mockRes, mockNext);

      expect(authService.verifyOtp).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.message).toBe('OTP verified successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors and call next() with ApiError', async () => {
      const error = new Error('Invalid OTP');
      authService.verifyOtp.mockRejectedValue(error);

      await verifyOtp(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, error.message));
    });
  });

  describe('login', () => {
    it('should login a user and call next()', async () => {
      const loginData = { token: 'fake-jwt-token', user: { id: 1, email: 'test@example.com' } };
      authService.loginUser.mockResolvedValue(loginData);

      mockReq.body = { email: 'test@example.com', password: 'password123' };

      await login(mockReq, mockRes, mockNext);

      expect(authService.loginUser).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.data).toEqual(loginData);
      expect(mockRes.message).toBe('Login successful');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle invalid credentials and call next() with ApiError', async () => {
      const error = new Error('Invalid credentials');
      authService.loginUser.mockRejectedValue(error);

      await login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(401, 'Invalid credentials', [error.message]));
    });
  });

  describe('logout', () => {
    it('should logout a user and call next()', async () => {
      authService.logout.mockResolvedValue();

      mockReq.headers.authorization = 'Bearer fake-jwt-token';

      await logout(mockReq, mockRes, mockNext);

      expect(authService.logout).toHaveBeenCalledWith('fake-jwt-token');
      expect(mockRes.data).toBeNull();
      expect(mockRes.message).toBe('Logged out successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle missing token and call next() with ApiError', async () => {
      mockReq.headers.authorization = undefined;

      await logout(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, 'Token not provided'));
    });

    it('should handle logout failure and call next() with ApiError', async () => {
      const error = new Error('Logout failed');
      authService.logout.mockRejectedValue(error);

      mockReq.headers.authorization = 'Bearer fake-jwt-token';

      await logout(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new ApiError(400, 'Failed to logout', [error.message]));
    });
  });
});
