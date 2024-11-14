const { ApiResponse } = require('../helpers/response.helper');

function roles(requiredRoles = ['Admin'], allowSelf = false) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return ApiResponse.send(res, 401, 'Access denied. User not authenticated.');
    }

    const userRoles = req.user.roles;

    // Check if the user is trying to access their own resource (allowSelf logic)
    if (allowSelf && req.params.id && req.user.id === req.params.id) {
      return next();
    }

    // Check if the user's roles include at least one of the required roles or "Admin"
    const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role) || role === 'Admin');

    if (!hasRequiredRole) {
      return ApiResponse.send(res, 403, 'Access denied. Insufficient permissions.');
    }

    next();
  };
}

module.exports = roles;
