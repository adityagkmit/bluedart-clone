const { redisClient } = require('../config/redis');
const { sendOtpEmail } = require('../helpers/email.helper');
const { User } = require('../models');
const userService = require('./users.service');
const bcrypt = require('bcryptjs');
const { generateToken, blacklistToken } = require('../helpers/jwt.helper');
const { ApiError } = require('../helpers/response.helper');

const registerUser = async payload => {
  const { email } = payload;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }

  const user = await userService.createUser(payload);
  return user;
};

const sendOtp = async email => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.is_email_verified) {
    throw new ApiError(409, 'Email already verified');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.setEx(email, 300, otp);
  console.log('Generated OTP:', otp);
  await sendOtpEmail(email, otp);

  return true;
};

const verifyOtp = async ({ email, otp }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.is_email_verified) {
    throw new ApiError(409, 'Email already verified');
  }

  const storedOtp = await redisClient.get(email);

  if (!storedOtp || storedOtp !== otp) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  await redisClient.del(email);
  user.is_email_verified = true;
  user.save();
  return true;
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });

  if (!user.is_email_verified) {
    throw new ApiError(401, 'Email not verified');
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(user.id);
  return { user, token };
};

const logout = async token => {
  await blacklistToken(token);
};

module.exports = {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
  logout,
};
