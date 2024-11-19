const userService = require('../services/users.service');
const { ApiResponse, ApiError } = require('../helpers/response.helper');

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    ApiResponse.send(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return ApiError.handleError(new ApiError(404, 'User not found'), res);
    }
    ApiResponse.send(res, 200, 'User retrieved successfully', user);
  } catch (error) {
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const createUser = async (req, res) => {
  try {
    const newUser = await userService.createUserByAdmin(req.body);
    ApiResponse.send(res, 201, 'User created successfully', newUser);
  } catch (error) {
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = await userService.updateUserById(userId, req.body);

    if (!updatedUser) {
      return ApiError.handleError(new ApiError(404, 'User not found or no changes made'), res);
    }

    ApiResponse.send(res, 200, 'User updated successfully', updatedUser);
  } catch (error) {
    console.error('Error updating user:', error.message);
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await userService.deleteUserById(userId);
    ApiResponse.send(res, 200, 'User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error.message);
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const getUserPayments = async (req, res) => {
  try {
    const { id } = req.params;

    const { page, limit } = req.query;
    const payments = await userService.getPaymentsByUserId(id, page, limit);
    ApiResponse.send(res, 200, 'User payments retrieved successfully', payments);
  } catch (error) {
    ApiError.handleError(error, res);
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return ApiError.handleError(new ApiError(400, 'No document uploaded.'), res);
    }

    const result = await userService.uploadDocument(req.file, req.user.id);
    ApiResponse.send(res, 200, 'Document uploaded successfully', result);
  } catch (error) {
    console.error('Error during document upload:', error);
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.verifyUserDocument(id);
    return ApiResponse.send(res, 200, 'Document verified successfully', user);
  } catch (error) {
    ApiError.handleError(error, res);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserPayments,
  uploadDocument,
  verifyDocument,
};
