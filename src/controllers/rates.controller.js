const ratesService = require('../services/rates.service');
const { ApiError } = require('../helpers/response.helper');

const getAllRates = async (req, res, next) => {
  try {
    const rates = await ratesService.getAllRates();
    if (!rates || rates.length === 0) {
      return next(new ApiError(404, 'No rates found.'));
    }
    res.data = rates;
    res.message = 'Rates retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = {
  getAllRates,
};
