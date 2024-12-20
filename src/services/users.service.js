const { User, Role, UserRole, Payment, Shipment, Status } = require('../models');
const { uploadFileToS3 } = require('../helpers/aws.helper');
const bcrypt = require('bcryptjs');
const { ApiError } = require('../helpers/response.helper');

const createUser = async ({ name, email, password, phoneNumber, roleName = 'Customer' }) => {
  const role = await Role.findOne({ where: { name: roleName } });

  if (!role) {
    throw new ApiError(404, `${roleName} role not found. Ensure roles are seeded in the database.`);
  }

  let user = await User.findOne({
    where: { email },
    include: {
      model: Role,
      as: 'Roles',
      attributes: ['id', 'name'],
    },
  });

  if (user) {
    const hasRole = user.Roles.some(existingRole => existingRole.name === roleName);

    if (hasRole) {
      throw new ApiError(400, `User with email '${email}' already has the '${roleName}' role.`);
    }

    await user.addRole(role);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone_number: phoneNumber,
    });

    await user.addRole(role);
  }

  return user;
};

const getAllUsers = async data => {
  const { page = 1, limit = 10 } = data;

  const offset = (page - 1) * limit;

  const { count, rows } = await User.findAndCountAll({
    include: {
      model: Role,
      through: { attributes: [] },
      attributes: ['name'],
    },
    offset,
    limit,
    order: [['created_at', 'DESC']],
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    users: rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      document_url: user.document_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles: user.Roles.map(role => role.name),
    })),
  };
};

const getUserById = async userId => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: {
      model: Role,
      through: { attributes: [] },
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone_number: user.phone_number,
    document_url: user.document_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
    roles: user.Roles.map(role => role.name),
  };
};

const createUserByAdmin = async userData => {
  const { name, email, password, phoneNumber, roles } = userData;

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone_number: phoneNumber,
  });

  if (roles && roles.length > 0) {
    const roleRecords = await Role.findAll({ where: { name: roles } });
    if (!roleRecords.length) {
      throw new ApiError(400, 'One or more specified roles do not exist');
    }
    await user.addRoles(roleRecords);
  } else {
    const defaultRole = await Role.findOne({ where: { name: 'Customer' } });
    if (!defaultRole) {
      throw new ApiError(404, 'Default customer role not found');
    }
    await user.addRole(defaultRole);
  }

  return user;
};

const updateUserById = async (userId, updateData) => {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  if (updateData.phoneNumber) {
    updateData.phone_number = updateData.phoneNumber;
  }

  const [rowsUpdated, [updatedUser]] = await User.update(updateData, {
    where: { id: userId },
    returning: true,
    individualHooks: true,
  });

  if (rowsUpdated === 0) {
    throw new ApiError(404, 'User not found or no changes made');
  }

  return updatedUser;
};

const deleteUserById = async userId => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  await user.destroy();

  await UserRole.update(
    { deleted_at: new Date() },
    {
      where: { user_id: userId },
      individualHooks: true,
    }
  );

  return true;
};

const getShipmentsByUserId = async (userId, data) => {
  const { page = 1, limit = 10 } = data;
  const offset = (page - 1) * limit;

  const shipments = await Shipment.findAndCountAll({
    where: { user_id: userId },
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Status, as: 'statuses' },
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    totalItems: shipments.count,
    totalPages: Math.ceil(shipments.count / limit),
    currentPage: page,
    data: shipments.rows,
  };
};

const getPaymentsByUserId = async (userId, data) => {
  const { page = 1, limit = 10 } = data;
  const offset = (page - 1) * limit;

  const payments = await Payment.findAndCountAll({
    where: { user_id: userId },
    include: [{ model: Shipment, as: 'Shipment', attributes: ['id', 'status'] }],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    totalItems: payments.count,
    totalPages: Math.ceil(payments.count / limit),
    currentPage: page,
    data: payments.rows,
  };
};

const uploadDocument = async (file, userId) => {
  const documentUrl = await uploadFileToS3(file, userId);

  const [updatedRowCount] = await User.update({ document_url: documentUrl }, { where: { id: userId } });

  if (updatedRowCount === 0) {
    throw new ApiError(404, 'User not found or document URL could not be updated');
  }

  return {
    documentUrl,
  };
};

const verifyUserDocument = async userId => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.document_url) {
    throw new ApiError(400, 'User document not found');
  }

  if (user.is_document_verified) {
    throw new ApiError(409, 'User document already verified');
  }

  user.is_document_verified = true;
  await user.save();
  return user;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  createUserByAdmin,
  updateUserById,
  deleteUserById,
  getShipmentsByUserId,
  getPaymentsByUserId,
  uploadDocument,
  verifyUserDocument,
};
