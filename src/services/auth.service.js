const { redisClient } = require('../config/redis');
const { sendOtpEmail } = require('../helpers/email.helper');
const { User } = require('../models');
const userService = require('./users.service');
const bcrypt = require('bcryptjs');
const { generateToken, blacklistToken } = require('../helpers/jwt.helper');
const { ApiError } = require('../helpers/response.helper');

exports.sendOtp = async email => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.setEx(email, 300, otp); // Store OTP in Redis for 1 minute
  console.log(otp);
  await sendOtpEmail(email, otp);

  return { message: 'OTP sent to email' };
};

exports.verifyOtp = async (email, otp) => {
  const storedOtp = await redisClient.get(email);

  if (!storedOtp || storedOtp !== otp) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  await redisClient.del(email);
  await redisClient.setEx(`${email}_verified`, 300, 'true');
  return true;
};

exports.registerUser = async payload => {
  const isVerified = await redisClient.get(`${payload.email}_verified`);

  if (isVerified !== 'true') {
    throw new ApiError(400, 'User not verified. Please complete OTP verification.');
  }

  return userService.createUser(payload);
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken(user.id);
  return { user, token };
};

exports.logout = async token => {
  await blacklistToken(token);
};
