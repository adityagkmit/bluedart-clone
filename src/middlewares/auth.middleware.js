const { verifyToken } = require('../helpers/jwt.helper');
const { User, Role } = require('../models');
const { ApiResponse, ApiError } = require('../helpers/response.helper');

const auth = async (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return ApiResponse.send(res, 401, 'Access denied. No token provided.');
  }

  try {
    // Verify token
    const decoded = await verifyToken(token);

    // Fetch user based on decoded token data
    const user = await User.findByPk(decoded.id, {
      include: { model: Role, through: { attributes: [] }, required: true },
    });

    if (!user) {
      return ApiResponse.send(res, 401, 'Invalid token. User not found.');
    }

    req.user = user;
    req.user.roles = user.Roles.map(role => role.name);

    next();
  } catch (error) {
    if (error.message === 'Token is blacklisted') {
      return ApiResponse.send(res, 401, 'Token has been revoked.');
    }

    if (error.name === 'TokenExpiredError') {
      return ApiResponse.send(res, 401, 'Token expired.');
    } else if (error.name === 'JsonWebTokenError') {
      return ApiResponse.send(res, 401, 'Invalid token.');
    }

    ApiError.handleError(new ApiError(400, 'An error occurred during authentication', [error.message]), res);
  }
};

module.exports = { auth };
