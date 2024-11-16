const userService = require('../services/users.service');
const { ApiResponse, ApiError } = require('../helpers/response.helper');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    ApiResponse.send(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

exports.getUserById = async (req, res) => {
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

exports.createUser = async (req, res) => {
  try {
    const newUser = await userService.createUserByAdmin(req.body);
    ApiResponse.send(res, 201, 'User created successfully', newUser);
  } catch (error) {
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

exports.updateUser = async (req, res) => {
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

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await userService.deleteUserById(userId);
    ApiResponse.send(res, 200, 'User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error.message);
    ApiError.handleError(new ApiError(400, error.message), res);
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const { id } = req.params;

    const { page, limit } = req.query;
    const payments = await userService.getPaymentsByUserId(id, page, limit);
    ApiResponse.send(res, 200, 'User payments retrieved successfully', payments);
  } catch (error) {
    ApiError.handleError(error, res);
  }
};
