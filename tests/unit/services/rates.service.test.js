const { getAllRates } = require('../../../src/services/rates.service');
const { Rate } = require('../../../src/models');

jest.mock('../../../src/models', () => ({
  Rate: {
    findAll: jest.fn(),
  },
}));

describe('Rates Service', () => {
  describe('getAllRates', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return all rates successfully', async () => {
      // Mock data
      const mockRates = [
        {
          id: 1,
          city_tier: 1,
          base_rate: 50,
          fragile_multiplier: 1.2,
          weight_multiplier: 1.5,
          size_multiplier: 1.3,
          delivery_option_multiplier: 2.0,
        },
        {
          id: 2,
          city_tier: 2,
          base_rate: 40,
          fragile_multiplier: 1.1,
          weight_multiplier: 1.4,
          size_multiplier: 1.2,
          delivery_option_multiplier: 1.8,
        },
      ];

      // Mock Rate.findAll
      Rate.findAll.mockResolvedValue(mockRates);

      // Call the service function
      const result = await getAllRates();

      // Assertions
      expect(Rate.findAll).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockRates);
    });

    it('should return an empty array if no rates are found', async () => {
      // Mock Rate.findAll to return an empty array
      Rate.findAll.mockResolvedValue([]);

      // Call the service function
      const result = await getAllRates();

      // Assertions
      expect(Rate.findAll).toHaveBeenCalledWith({
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
      expect(result).toEqual([]);
    });

    it('should throw an error if Rate.findAll fails', async () => {
      // Mock Rate.findAll to throw an error
      const mockError = new Error('Database error');
      Rate.findAll.mockRejectedValue(mockError);

      // Call the service function and expect an error
      await expect(getAllRates()).rejects.toThrow('Database error');

      // Assertions
      expect(Rate.findAll).toHaveBeenCalledWith({
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
    });
  });
});
