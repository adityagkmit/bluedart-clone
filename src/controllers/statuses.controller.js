const statusService = require('../services/statuses.service');
const { ApiError } = require('../helpers/response.helper');

const getStatusById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRoles = req.user.Roles.map(role => role.name);
    const statusId = req.params.id;

    const status = await statusService.getStatusById(statusId, userId, userRoles);
    if (!status) {
      return next(new ApiError(404, 'Status not found'));
    }

    res.data = status;
    res.message = 'Status retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(error.statusCode || 400, error.message));
  }
};

module.exports = {
  getStatusById,
};
