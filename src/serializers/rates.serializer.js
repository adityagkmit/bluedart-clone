const { toCamelCase } = require('../helpers/serializer.helper');

const ratesSerializer = (req, res, next) => {
  if (!res.data) return next();

  res.data = res.data.map(rate => ({
    id: rate.id,
    cityTier: toCamelCase(rate.city_tier),
    baseRate: parseFloat(rate.base_rate),
    fragileMultiplier: parseFloat(rate.fragile_multiplier),
    weightMultiplier: parseFloat(rate.weight_multiplier),
    sizeMultiplier: parseFloat(rate.size_multiplier),
    deliveryOptionMultiplier: parseFloat(rate.delivery_option_multiplier),
  }));

  next();
};

module.exports = ratesSerializer;
