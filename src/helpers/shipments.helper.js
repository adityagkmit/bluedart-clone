const { cityTiers } = require('../constants/cities');
const { ApiError } = require('../helpers/response.helper');

function extractCityFromAddress(address) {
  const addressParts = address.split(',').map(part => part.trim());

  for (const part of addressParts) {
    if (cityTiers[part]) {
      return part; // Return the first matched city
    }
  }

  throw new ApiError(404, 'City not found in the provided address');
}

function getCityTier(city) {
  return cityTiers[city] || 'Tier4';
}

function calculatePrice(rate, shipmentData) {
  const { weight, dimensions, is_fragile, delivery_option } = shipmentData;

  const deliveryOptionMultiplier = delivery_option === 'Express' ? rate.delivery_option_multiplier : 1; // No multiplier for standard delivery

  const volume = dimensions.length * dimensions.width * dimensions.height;

  const weightMultiplier = rate.weight_multiplier || 1;
  const sizeMultiplier = rate.size_multiplier || 1;

  const fragileMultiplier = is_fragile ? rate.fragile_multiplier : 1;

  const initialPrice = Number(rate.base_rate);
  const weightPrice = weightMultiplier * weight;
  const sizePrice = sizeMultiplier * volume;
  const multiplier = fragileMultiplier * deliveryOptionMultiplier;
  const finalPrice = (initialPrice + weightPrice + sizePrice) * multiplier;

  if (isNaN(finalPrice)) {
    throw new ApiError(
      400,
      'Calculation resulted in an invalid number. Please check rate and shipment data.'
    );
  }

  return finalPrice.toFixed(2);
}

module.exports = {
  extractCityFromAddress,
  getCityTier,
  calculatePrice,
};
