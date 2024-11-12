'use strict';

module.exports = {
  up: async queryInterface => {
    const ratesData = [
      {
        city_tier: 'Tier1',
        base_rate: 100,
        fragile_multiplier: 1.5,
        weight_multiplier: 1.2,
        size_multiplier: 1.1,
        delivery_option_multiplier: 1.2,
      },
      {
        city_tier: 'Tier2',
        base_rate: 80,
        fragile_multiplier: 1.4,
        weight_multiplier: 1.1,
        size_multiplier: 1.0,
        delivery_option_multiplier: 1.2,
      },
      {
        city_tier: 'Tier3',
        base_rate: 60,
        fragile_multiplier: 1.3,
        weight_multiplier: 1.0,
        size_multiplier: 0.9,
        delivery_option_multiplier: 1.2,
      },
      {
        city_tier: 'Tier4',
        base_rate: 50,
        fragile_multiplier: 1.2,
        weight_multiplier: 0.9,
        size_multiplier: 0.8,
        delivery_option_multiplier: 1.2,
      },
    ];

    await queryInterface.bulkInsert('rates', ratesData, {});
  },

  down: async queryInterface => {
    await queryInterface.bulkDelete('rates', null, {});
  },
};
