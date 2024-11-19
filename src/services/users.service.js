const { User, Role, UsersRoles, Payment, Shipment } = require('../models');
const { redisClient } = require('../config/redis');
const { uploadFileToS3 } = require('../helpers/aws.helper');
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

  // Associate the user with the 'Customer' role
  await user.addRole(customerRole);

  // remove the verification flag after successful registration
  await redisClient.del(`${email}_verified`);

  return user;
};

exports.getAllUsers = async () => {
  const users = await User.findAll({
    include: {
      model: Role,
      through: { attributes: [] }, // Exclude details from the join table
    },
  });

  return users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone_number: user.phone_number,
    document_url: user.document_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
    roles: user.Roles.map(role => role.name), // Extract role names into an array
  }));
};

exports.getUserById = async userId => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: {
      model: Role,
      through: { attributes: [] },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone_number: user.phone_number,
    document_url: user.document_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
    roles: user.Roles.map(role => role.name), // Extract role names into an array
  };
};

exports.createUserByAdmin = async userData => {
  const { name, email, password, phone_number, roles } = userData;

  // Check if the user already exists
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new Error('User already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone_number,
  });

  // Assign roles if provided, otherwise assign the default 'Customer' role
  if (roles && roles.length > 0) {
    const roleRecords = await Role.findAll({ where: { name: roles } });
    if (roleRecords.length > 0) {
      await user.addRoles(roleRecords);
    }
  } else {
    const defaultRole = await Role.findOne({ where: { name: 'Customer' } });
    await user.addRole(defaultRole);
  }

  return user;
};

exports.updateUserById = async (userId, updateData) => {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const [rowsUpdated, [updatedUser]] = await User.update(updateData, {
    where: { id: userId },
    returning: true, // Return the updated user data
    individualHooks: true, // Apply hooks if any
  });

  if (rowsUpdated === 0) {
    throw new Error('User not found or no changes made');
  }

  return updatedUser;
};

exports.deleteUserById = async userId => {
  const user = await User.findByPk(userId);
  if (!user) return null;

  await user.destroy();

  await UsersRoles.update(
    { deleted_at: new Date() },
    {
      where: { user_id: userId },
      individualHooks: true, // Ensures hooks are run for updates if needed
    }
  );

  return true;
};

exports.getPaymentsByUserId = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const payments = await Payment.findAndCountAll({
    where: { user_id: userId },
    include: [{ model: Shipment, as: 'Shipment', attributes: ['id', 'status'] }],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    total: payments.count,
    pages: Math.ceil(payments.count / limit),
    currentPage: page,
    data: payments.rows,
  };
};

exports.uploadDocument = async (file, userId) => {
  try {
    const documentUrl = await uploadFileToS3(file, userId);

    // Update the user document URL in the database
    const [updatedRowCount] = await User.update({ document_url: documentUrl }, { where: { id: userId } });

    if (updatedRowCount === 0) {
      throw new Error('User not found or document URL could not be updated.');
    }

    return {
      message: 'Document uploaded successfully.',
      documentUrl,
    };
  } catch (error) {
    console.error('Error uploading document to S3:', error);
    throw new Error('Failed to upload document.');
  }
};

exports.verifyUserDocument = async userId => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.document_url) {
    throw new Error('User document not found');
  }

  user.is_document_verified = true;
  await user.save();
  return user;
};
