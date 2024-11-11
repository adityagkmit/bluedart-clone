'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rates', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      city_tier: {
        type: Sequelize.ENUM('Tier1', 'Tier2', 'Tier3', 'Tier4'),
        allowNull: false,
      },
      base_rate: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      fragile_multiplier: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      weight_multiplier: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      size_multiplier: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      delivery_option_multiplier: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async queryInterface => {
    await queryInterface.dropTable('rates');
  },
};
