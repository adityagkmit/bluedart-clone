const { ApiResponse, ApiError } = require('../helpers/response.helper');
const authService = require('../services/auth.service');

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await authService.sendOtp(email);
    ApiResponse.send(res, 200, 'OTP sent successfully', result);
  } catch (error) {
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = await authService.verifyOtp(email, otp);
    if (!isValid) {
      return ApiError.handleError(new ApiError(400, 'Invalid or expired OTP'), res);
    }
    ApiResponse.send(res, 200, 'OTP verified successfully');
  } catch (error) {
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

exports.register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    ApiResponse.send(res, 201, 'User registered successfully', user);
  } catch (error) {
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    ApiResponse.send(res, 200, 'Login successful', result);
  } catch (error) {
    ApiError.handleError(new ApiError(401, 'Invalid credentials', [error.message]), res);
  }
};

exports.logout = async (req, res) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) {
    return ApiError.handleError(new ApiError(400, 'Token not provided'), res);
  }

  try {
    await authService.logout(token);
    ApiResponse.send(res, 200, 'Logged out successfully');
  } catch (error) {
    ApiError.handleError(new ApiError(400, 'Failed to logout', [error.message]), res);
  }
};
