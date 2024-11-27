const {
  extractCityFromAddress,
  getCityTier,
  calculatePrice,
} = require('../../../src/helpers/shipments.helper');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('../../../src/constants/cities', () => ({
  cityTiers: {
    'New York': 'Tier1',
    'Los Angeles': 'Tier2',
    Chicago: 'Tier3',
  },
}));

describe('Shipments Helper Functions', () => {
  // Test for extractCityFromAddress function
  describe('extractCityFromAddress', () => {
    it('should extract city from the address if city exists in cityTiers', () => {
      const address = '123 Main St, New York, NY 10001';
      const city = extractCityFromAddress(address);
      expect(city).toBe('New York');
    });

    it('should throw an error if no city is found in the address', () => {
      const address = '123 Main St, Unknown City, NY 10001';
      expect(() => extractCityFromAddress(address)).toThrow(ApiError);
      expect(() => extractCityFromAddress(address)).toThrow('City not found in the provided address');
    });
  });

  // Test for getCityTier function
  describe('getCityTier', () => {
    it('should return the correct tier for a known city', () => {
      expect(getCityTier('New York')).toBe('Tier1');
      expect(getCityTier('Los Angeles')).toBe('Tier2');
      expect(getCityTier('Chicago')).toBe('Tier3');
    });

    it('should return Tier4 for an unknown city', () => {
      expect(getCityTier('Unknown City')).toBe('Tier4');
    });
  });

  // Test for calculatePrice function
  describe('calculatePrice', () => {
    const rate = {
      base_rate: 10,
      weight_multiplier: 2,
      size_multiplier: 1,
      fragile_multiplier: 1.5,
      delivery_option_multiplier: 1.2,
    };

    it('should calculate the price correctly based on shipment data', () => {
      const shipmentData = {
        weight: 5,
        dimensions: { length: 2, width: 2, height: 2 },
        is_fragile: true,
        delivery_option: 'Express',
      };
      const price = calculatePrice(rate, shipmentData);
      expect(price).toBe('50.40'); // base_rate + weight + size + fragile + delivery_option_multiplier
    });

    it('should return price with standard delivery multiplier', () => {
      const shipmentData = {
        weight: 5,
        dimensions: { length: 2, width: 2, height: 2 },
        is_fragile: false,
        delivery_option: 'Standard',
      };
      const price = calculatePrice(rate, shipmentData);
      expect(price).toBe('28.00'); // base_rate + weight + size (no delivery option multiplier)
    });

    it('should throw an error if the calculation results in NaN', () => {
      const shipmentData = {
        weight: NaN,
        dimensions: { length: 2, width: 2, height: 2 },
        is_fragile: true,
        delivery_option: 'Express',
      };
      expect(() => calculatePrice(rate, shipmentData)).toThrow(ApiError);
      expect(() => calculatePrice(rate, shipmentData)).toThrow(
        'Calculation resulted in an invalid number. Please check rate and shipment data.'
      );
    });

    it('should return price with zero if all values are zero', () => {
      const shipmentData = {
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        is_fragile: false,
        delivery_option: 'Standard',
      };
      const price = calculatePrice(rate, shipmentData);
      expect(price).toBe('10.00'); // base_rate (all other values are zero)
    });
  });
});
