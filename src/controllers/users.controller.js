const { ApiError } = require('../helpers/response.helper');
const userService = require('../services/users.service');

const getCurrentUser = async (req, res, next) => {
  try {
    res.data = req.user;
    res.message = 'User details retrieved successfully';
    next();
  } catch (error) {
    console.error('Error fetching user details:', error);
    next(new ApiError(400, 'Failed to retrieve user details.'));
  }
};

// Get All Users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers(req.query);
    res.data = users;
    res.message = 'Users retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, 'Failed to retrieve users', [error.message]));
  }
};

// Get User By ID
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }
    res.data = user;
    res.message = 'User retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Create User
const createUser = async (req, res, next) => {
  try {
    const newUser = await userService.createUserByAdmin(req.body);
    res.data = newUser;
    res.message = 'User created successfully';
    res.statusCode = 201;
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Update User
const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserById(req.params.id, req.body);

    if (!updatedUser) {
      return next(new ApiError(404, 'User not found or no changes made'));
    }

    res.data = updatedUser;
    res.message = 'User updated successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Delete User
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUserById(req.params.id);
    res.data = null;
    res.message = 'User deleted successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Get User Shipments
const getUserShipments = async (req, res, next) => {
  try {
    const shipments = await userService.getShipmentsByUserId(req.params.id, req.query);
    res.data = shipments;
    res.message = 'User Shipments retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Get User Payments
const getUserPayments = async (req, res, next) => {
  try {
    const payments = await userService.getPaymentsByUserId(req.params.id, req.query);
    res.data = payments;
    res.message = 'User payments retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Upload Document
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'No document uploaded.'));
    }

    const result = await userService.uploadDocument(req.file, req.user.id);
    res.data = result;
    res.message = 'Document uploaded successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Verify Document
const verifyDocument = async (req, res, next) => {
  try {
    await userService.verifyUserDocument(req.params.id);
    res.message = 'Document verified successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = {
  getCurrentUser,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserShipments,
  getUserPayments,
  uploadDocument,
  verifyDocument,
};
