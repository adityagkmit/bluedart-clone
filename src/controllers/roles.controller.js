const rolesService = require('../services/roles.service');
const { ApiError } = require('../helpers/response.helper');

// Get All Roles
const getAllRoles = async (req, res, next) => {
  try {
    const roles = await rolesService.getAllRoles();
    if (!roles || roles.length === 0) {
      return next(new ApiError(404, 'No roles found'));
    }
    res.data = roles;
    res.message = 'Roles retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = {
  getAllRoles,
};
