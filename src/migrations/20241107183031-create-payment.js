'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
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
      shipment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'shipments',
          key: 'id',
        },
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      method: {
        type: Sequelize.ENUM('Online', 'COD'),
        defaultValue: 'Online',
      },
      status: {
        type: Sequelize.ENUM('Pending', 'Completed', 'Failed'),
        defaultValue: 'Pending',
      },
      transaction_details: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('payments');
  },
};
