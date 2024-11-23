const { ApiError } = require('../helpers/response.helper');
const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    res.data = user;
    res.message = 'User registered successfully';
    res.statusCode = 201;
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const sendOtp = async (req, res, next) => {
  try {
    await authService.sendOtp(req.body.email);
    res.message = 'OTP sent successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    await authService.verifyOtp(req.body);
    res.message = 'OTP verified successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Login User
const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.data = result;
    res.message = 'Login successful';
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid credentials', [error.message]));
  }
};

// Logout User
const logout = async (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) {
    return next(new ApiError(400, 'Token not provided'));
  }

  try {
    await authService.logout(token);
    res.data = null;
    res.message = 'Logged out successfully';
    next();
  } catch (error) {
    next(new ApiError(400, 'Failed to logout', [error.message]));
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  login,
  logout,
};
