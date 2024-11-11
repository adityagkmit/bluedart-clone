const { redisClient } = require('../config/redis');
const { sendOtpEmail } = require('../utils/email');

async function sendOtp(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(email);
  await redisClient.setEx(email, 300, otp); // Store OTP in Redis for 1 minute
  console.log(otp);
  await sendOtpEmail(email, otp);

  return { message: 'OTP sent to email' };
}

module.exports = {
  sendOtp,
};
