const statusService = require('../services/statuses.service');
const { ApiError } = require('../helpers/response.helper');

// Create Status
const createStatus = async (req, res, next) => {
  try {
    const status = await statusService.createStatus(req.body, req.user);
    res.data = status;
    res.message = 'Status created successfully';
    res.statusCode = 201;
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Get Status by ID
const getStatusById = async (req, res, next) => {
  try {
    const status = await statusService.getStatusById(req.params.id);
    if (!status) {
      return next(new ApiError(404, 'Status not found'));
    }
    res.data = status;
    res.message = 'Status retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Delete Status
const deleteStatus = async (req, res, next) => {
  try {
    await statusService.deleteStatus(req.params.id, req.user);
    res.data = null;
    res.message = 'Status deleted successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = {
  createStatus,
  getStatusById,
  deleteStatus,
};
