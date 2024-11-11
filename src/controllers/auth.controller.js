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
