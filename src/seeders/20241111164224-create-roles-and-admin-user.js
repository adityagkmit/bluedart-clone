'use strict';
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/../../.env' });

module.exports = {
  up: async queryInterface => {
    // Insert roles
    const roles = [
      {
        name: 'Customer',
        description: 'Book and manage shipments.',
      },
      {
        name: 'Admin',
        description: 'Manage overall operations.',
      },
      {
        name: 'Delivery Agent',
        description: 'Handle deliveries and update shipment statuses.',
      },
    ];

    await queryInterface.bulkInsert('roles', roles, {});

    // Create the admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || '123456', 10);
    const adminUser = {
      name: 'Aditya Singh Rajawat',
      email: 'adityasinghrajawat393@gmail.com',
      phone_number: '9876543210',
      password: hashedPassword,
    };

    await queryInterface.bulkInsert('users', [adminUser], {});

    // Get the 'Admin' role ID from the database
    const adminRole = await queryInterface.sequelize.query(`SELECT id FROM roles WHERE name = 'Admin';`);

    if (adminRole[0] && adminRole[0][0]) {
      const adminRoleId = adminRole[0][0].id;
      const user = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE email = 'adityasinghrajawat393@gmail.com';`
      );

      if (user[0] && user[0][0]) {
        const userId = user[0][0].id;
        const userRoleAssociation = {
          user_id: userId,
          role_id: adminRoleId,
        };

        await queryInterface.bulkInsert('users_roles', [userRoleAssociation], {});
      }
    }
  },

  down: async queryInterface => {
    await queryInterface.bulkDelete('users_roles', null, {});
    await queryInterface.bulkDelete('users', { email: 'adityasinghrajawat393@gmail.com' }, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};
