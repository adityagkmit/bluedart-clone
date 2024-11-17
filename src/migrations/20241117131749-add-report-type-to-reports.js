'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('reports', 'type', {
      type: Sequelize.ENUM('Shipment Report', 'Customer Report'),
      allowNull: false,
      defaultValue: 'Shipment Report', // Optional: set a default value
    });
  },

  down: async queryInterface => {
    // Remove the column
    await queryInterface.removeColumn('reports', 'type');

    // Drop the ENUM type to clean up
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reports_type";');
  },
};
