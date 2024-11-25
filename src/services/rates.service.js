const { Rate } = require('../models');

const getAllRates = async () => {
  const rates = await Rate.findAll({
    attributes: [
      'id',
      'city_tier',
      'base_rate',
      'fragile_multiplier',
      'weight_multiplier',
      'size_multiplier',
      'delivery_option_multiplier',
    ],
  });
  return rates;
};

module.exports = {
  getAllRates,
};
