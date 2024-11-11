const { User, Role } = require('../models');
const { redisClient } = require('../config/redis');
const bcrypt = require('bcryptjs');

exports.createUser = async ({ name, email, password, phone_number }) => {
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create and save the new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone_number,
  });

  const customerRole = await Role.findOne({ where: { name: 'Customer' } });
  if (!customerRole) {
    throw new Error('Customer role not found. Ensure roles are seeded in the database.');
  }

  console.log(customerRole);

  // Associate the user with the 'Customer' role
  await user.addRole(customerRole);

  // remove the verification flag after successful registration
  await redisClient.del(`${email}_verified`);

  return user;
};
