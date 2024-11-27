const { sendOtp, verifyOtp, registerUser, loginUser, logout } = require('../../../src/services/auth.service');
const { ApiError } = require('../../../src/helpers/response.helper');
const { redisClient } = require('../../../src/config/redis');
const { sendOtpEmail } = require('../../../src/helpers/email.helper');
const { User, Role } = require('../../../src/models');
const userService = require('../../../src/services/users.service');
const bcrypt = require('bcryptjs');
const { generateToken, blacklistToken } = require('../../../src/helpers/jwt.helper');

jest.mock('../../../src/config/redis');
jest.mock('../../../src/helpers/email.helper');
jest.mock('../../../src/models');
jest.mock('../../../src/services/users.service');
jest.mock('bcryptjs');
jest.mock('../../../src/helpers/jwt.helper');

describe('Auth Service', () => {
  let mockUser, mockPayload, mockEmail, mockOtp, mockToken;

  beforeEach(() => {
    mockEmail = 'test@example.com';
    mockOtp = '123456';
    mockPayload = { email: mockEmail, password: 'Password123!' };

    mockUser = {
      id: 1,
      email: mockEmail,
      password: bcrypt.hashSync('Password123!', 10),
      is_email_verified: false,
      is_document_verified: false,
      Roles: [{ name: 'user' }],
      save: jest.fn().mockResolvedValue(mockUser), // Mock save method
    };

    redisClient.setEx.mockResolvedValue(true);
    redisClient.get.mockResolvedValue(mockOtp);
    redisClient.del.mockResolvedValue(true);
    sendOtpEmail.mockResolvedValue(true);
    bcrypt.compare.mockResolvedValue(true);
    generateToken.mockReturnValue('mock_token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test for registerUser
  describe('registerUser', () => {
    it('should register user successfully', async () => {
      User.findOne.mockResolvedValue(null); // User does not exist
      userService.createUser.mockResolvedValue(mockUser);

      const result = await registerUser(mockPayload);

      expect(result).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: mockEmail } });
      expect(userService.createUser).toHaveBeenCalledWith(mockPayload);
    });

    it('should throw error if user already exists', async () => {
      User.findOne.mockResolvedValue(mockUser); // User exists

      await expect(registerUser(mockPayload)).rejects.toThrowError(new ApiError(409, 'User already exists'));
    });
  });

  // Test for sendOtp
  describe('sendOtp', () => {
    it('should generate and send OTP successfully', async () => {
      User.findOne.mockResolvedValue(mockUser); // User found

      const result = await sendOtp(mockEmail);

      expect(result).toBe(true);
      expect(redisClient.setEx).toHaveBeenCalledWith(mockEmail, 300, expect.any(String)); // OTP is set in Redis
      expect(sendOtpEmail).toHaveBeenCalledWith(mockEmail, expect.any(String)); // Email sent
    });

    it('should throw error if user not found', async () => {
      User.findOne.mockResolvedValue(null); // User not found

      await expect(sendOtp(mockEmail)).rejects.toThrowError(new ApiError(404, 'User not found'));
    });

    it('should throw error if email is already verified', async () => {
      mockUser.is_email_verified = true;
      User.findOne.mockResolvedValue(mockUser);

      await expect(sendOtp(mockEmail)).rejects.toThrowError(new ApiError(409, 'Email already verified'));
    });
  });

  // Test for verifyOtp
  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      User.findOne.mockResolvedValue(mockUser); // User found
      redisClient.get.mockResolvedValue(mockOtp); // Correct OTP

      const result = await verifyOtp({ email: mockEmail, otp: mockOtp });

      expect(result).toBe(true);
      expect(redisClient.del).toHaveBeenCalledWith(mockEmail); // OTP removed from Redis
      expect(mockUser.is_email_verified).toBe(true); // User's email verified
    });

    it('should throw error if OTP is invalid or expired', async () => {
      User.findOne.mockResolvedValue(mockUser); // User found
      redisClient.get.mockResolvedValue('654321'); // Invalid OTP

      await expect(verifyOtp({ email: mockEmail, otp: mockOtp })).rejects.toThrowError(
        new ApiError(400, 'Invalid or expired OTP')
      );
    });

    it('should throw error if user not found', async () => {
      User.findOne.mockResolvedValue(null); // User not found

      await expect(verifyOtp({ email: mockEmail, otp: mockOtp })).rejects.toThrowError(
        new ApiError(404, 'User not found')
      );
    });

    it('should throw error if email is already verified', async () => {
      mockUser.is_email_verified = true;
      User.findOne.mockResolvedValue(mockUser); // User is already verified

      await expect(verifyOtp({ email: mockEmail, otp: mockOtp })).rejects.toThrowError(
        new ApiError(409, 'Email already verified')
      );
    });
  });

  // Test for loginUser
  describe('loginUser', () => {
    it('should log in user successfully', async () => {
      mockUser.is_email_verified = true; // Ensure email is verified
      User.findOne.mockResolvedValue(mockUser); // User found
      bcrypt.compare.mockResolvedValue(true); // Password matches

      const result = await loginUser(mockPayload);

      expect(result.token).toBe('mock_token');
      expect(result.user.email).toBe(mockEmail);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: mockEmail },
        include: {
          model: Role,
          through: { attributes: [] },
          attributes: ['name'],
        },
      });
    });

    it('should throw error if credentials are invalid', async () => {
      bcrypt.compare.mockResolvedValue(false); // Password does not match

      await expect(loginUser(mockPayload)).rejects.toThrowError(new ApiError(401, 'Invalid credentials'));
    });

    it('should throw error if email is not verified', async () => {
      mockUser.is_email_verified = false; // Ensure email is not verified
      User.findOne.mockResolvedValue(mockUser); // Email not verified

      await expect(loginUser(mockPayload)).rejects.toThrowError(new ApiError(401, 'Email not verified'));
    });
  });

  // Test for logout
  describe('logout', () => {
    it('should log out user successfully', async () => {
      const mockToken = 'mock_token';

      blacklistToken.mockResolvedValue(true);

      await logout(mockToken);

      expect(blacklistToken).toHaveBeenCalledWith(mockToken); // Token blacklisted
    });
  });
});
