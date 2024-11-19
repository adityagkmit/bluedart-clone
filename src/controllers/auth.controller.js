const { ApiResponse, ApiError } = require('../helpers/response.helper');
const authService = require('../services/auth.service');

const sendOtp = async (req, res) => {
  try {
    const result = await authService.sendOtp(req.body.email);
    ApiResponse.send(res, 200, 'OTP sent successfully', result);
  } catch (error) {
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const isValid = await authService.verifyOtp(req.body);
    if (!isValid) {
      return ApiError.handleError(new ApiError(400, 'Invalid or expired OTP'), res);
    }
    ApiResponse.send(res, 200, 'OTP verified successfully');
  } catch (error) {
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    ApiResponse.send(res, 201, 'User registered successfully', user);
  } catch (error) {
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    ApiResponse.send(res, 200, 'Login successful', result);
  } catch (error) {
    ApiError.handleError(new ApiError(401, 'Invalid credentials', [error.message]), res);
  }
};

const logout = async (req, res) => {
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

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  login,
  logout,
};
