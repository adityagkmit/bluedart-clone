const authService = require('../services/auth.service');

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await authService.sendOtp(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = await authService.verifyOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    res.status(200).json({ message: 'OTP verified' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
