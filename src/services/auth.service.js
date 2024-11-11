const { redisClient } = require('../config/redis');
const { sendOtpEmail } = require('../utils/email');
const userService = require('./users.service');

async function sendOtp(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(email);
  await redisClient.setEx(email, 300, otp); // Store OTP in Redis for 1 minute
  console.log(otp);
  await sendOtpEmail(email, otp);

  return { message: 'OTP sent to email' };
}

async function verifyOtp(email, otp) {
  const storedOtp = await redisClient.get(email);
  if (storedOtp && storedOtp === otp) {
    await redisClient.del(email);
    await redisClient.setEx(`${email}_verified`, 300, 'true');
    return true;
  }
  return false;
}

async function registerUser(payload) {
  const isVerified = await redisClient.get(`${payload.email}_verified`);
  if (isVerified !== 'true') {
    throw new Error('User not verified. Please complete OTP verification.');
  }

  const user = await userService.createUser(payload);

  return user;
}

module.exports = {
  sendOtp,
  verifyOtp,
  registerUser,
};
