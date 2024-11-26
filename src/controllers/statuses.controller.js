const statusService = require('../services/statuses.service');
const { ApiError } = require('../helpers/response.helper');

const getStatusById = async (req, res, next) => {
  try {
    const status = await statusService.getStatusById(req.params, req.user);
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
