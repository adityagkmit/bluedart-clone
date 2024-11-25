const { ApiError } = require('../helpers/response.helper');

const checkDocumentVerification = (req, res, next) => {
  if (!req.user) {
    return ApiError.handleError(new ApiError(401, 'Unauthorized'), res);
  }

  const { is_document_verified, Roles } = req.user;
  const isAdmin = Roles && Roles.some(role => role.name === 'Admin');

  if (!is_document_verified && !isAdmin) {
    return ApiError.handleError(new ApiError(403, 'Access denied. Document verification is required.'), res);
  }

  next();
};

module.exports = checkDocumentVerification;
