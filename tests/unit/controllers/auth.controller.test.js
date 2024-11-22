const { sendOtp, verifyOtp, register, login, logout } = require('../../../src/controllers/auth.controller');
const authService = require('../../../src/services/auth.service');
const { ApiError } = require('../../../src/helpers/response.helper');
const { faker } = require('@faker-js/faker');

jest.mock('../../../src/services/auth.service');
jest.mock('../../../src/helpers/response.helper', () => ({
  ApiError: jest.fn().mockImplementation((statusCode, message, errors = []) => ({
    statusCode,
    message,
    errors,
  })),
}));

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('should send OTP successfully', async () => {
      const email = faker.internet.email();
      const otp = faker.string.numeric(6); // Use string.numeric instead of random.numeric
      mockReq.body.email = email;
      authService.sendOtp.mockResolvedValue(otp);

      await sendOtp(mockReq, mockRes, mockNext);

      expect(mockRes.data).toBe(otp);
      expect(mockRes.message).toBe('OTP sent successfully');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors when sending OTP', async () => {
      const errorMessage = faker.lorem.sentence();
      authService.sendOtp.mockRejectedValue(new Error(errorMessage));

      await sendOtp(mockReq, mockRes, mockNext);

      // Expect the error passed to next to match the ApiError structure
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: errorMessage,
          statusCode: 400,
        })
      );
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      const body = { email: faker.internet.email(), otp: faker.number.int() };
      mockReq.body = body;
      authService.verifyOtp.mockResolvedValue(true);

      await verifyOtp(mockReq, mockRes, mockNext);

      expect(authService.verifyOtp).toHaveBeenCalledWith(body);
      expect(mockRes.message).toBe('OTP verified successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle invalid or expired OTP', async () => {
      const body = { email: faker.internet.email(), otp: faker.string.numeric(6) };
      mockReq.body = body;
      authService.verifyOtp.mockResolvedValue(false);

      await verifyOtp(mockReq, mockRes, mockNext);

      // Match the error based on properties rather than using expect.any
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid or expired OTP',
          statusCode: 400,
        })
      );
    });
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const user = {
        id: faker.number.int(),
        name: faker.name.fullName(),
        email: faker.internet.email(),
      };
      const userInput = { email: user.email, password: faker.internet.password() };
      mockReq.body = userInput;
      authService.registerUser.mockResolvedValue(user);

      await register(mockReq, mockRes, mockNext);

      expect(authService.registerUser).toHaveBeenCalledWith(userInput);
      expect(mockRes.data).toEqual(user);
      expect(mockRes.message).toBe('User registered successfully');
      expect(mockRes.statusCode).toBe(201);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during registration', async () => {
      const errorMessage = 'Campana ultra vulnero tum vos denuo fuga constans.';
      const errorStatusCode = 400;

      mockReq.body = { email: faker.internet.email(), password: faker.internet.password() };
      authService.registerUser.mockRejectedValue(new Error(errorMessage));

      await register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: errorMessage,
          statusCode: errorStatusCode,
        })
      );

      const errorInstance = mockNext.mock.calls[0][0];
      expect(errorInstance.message).toBe(errorMessage);
      expect(errorInstance.statusCode).toBe(errorStatusCode);
    });
  });

  describe('login', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
      mockReq = { body: {} };
      mockRes = { data: null, message: '', statusCode: 200 };
      mockNext = jest.fn();
    });

    it('should log in a user successfully', async () => {
      const credentials = { email: faker.internet.email(), password: faker.internet.password() };
      const loginResult = { token: faker.string.alphanumeric(30) }; // Fixed

      mockReq.body = credentials;
      authService.loginUser.mockResolvedValue(loginResult);

      await login(mockReq, mockRes, mockNext);

      expect(authService.loginUser).toHaveBeenCalledWith(credentials);
      expect(mockRes.data).toEqual(loginResult);
      expect(mockRes.message).toBe('Login successful');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle invalid credentials', async () => {
      const credentials = { email: faker.internet.email(), password: faker.internet.password() };
      const errorMessage = 'Invalid credentials';

      mockReq.body = credentials;
      authService.loginUser.mockRejectedValue(new Error(errorMessage));

      await login(mockReq, mockRes, mockNext);

      expect(authService.loginUser).toHaveBeenCalledWith(credentials);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: errorMessage,
          statusCode: 401,
        })
      );
      const errorInstance = mockNext.mock.calls[0][0];
      expect(errorInstance.message).toBe(errorMessage);
      expect(errorInstance.statusCode).toBe(401);
    });
  });

  describe('logout', () => {
    it('should log out a user successfully', async () => {
      const token = faker.string.alphanumeric(20);
      mockReq.headers['authorization'] = `Bearer ${token}`;
      authService.logout.mockResolvedValue();

      await logout(mockReq, mockRes, mockNext);

      expect(authService.logout).toHaveBeenCalledWith(token);
      expect(mockRes.data).toBeNull();
      expect(mockRes.message).toBe('Logged out successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle missing token', async () => {
      mockReq.headers['authorization'] = undefined;

      await logout(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Token not provided',
          errors: [],
        })
      );
    });

    it('should handle service errors during logout', async () => {
      const token = faker.string.alphanumeric(20);
      const errorMessage = faker.lorem.sentence();
      mockReq.headers['authorization'] = `Bearer ${token}`;
      authService.logout.mockRejectedValue(new Error(errorMessage));

      await logout(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Failed to logout',
          errors: [errorMessage],
        })
      );
    });
  });
});
