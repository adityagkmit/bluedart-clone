'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shipments', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      pickup_address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      delivery_address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      weight: {
        type: Sequelize.REAL,
        allowNull: false,
      },
      dimensions: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      is_fragile: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      delivery_option: {
        type: Sequelize.ENUM('Standard', 'Express'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('Pending', 'In Transit', 'Out for Delivery', 'Delivered'),
        defaultValue: 'Pending',
      },
      rate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'rates',
          key: 'id',
        },
      },
      price: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      preferred_delivery_date: {
        type: Sequelize.DATE,
      },
      preferred_delivery_time: {
        type: Sequelize.TIME,
      },
      delivery_agent_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: true,
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
    await queryInterface.dropTable('shipments');
  },
};
