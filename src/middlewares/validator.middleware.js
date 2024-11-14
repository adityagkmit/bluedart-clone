const { ApiError } = require('../helpers/response.helper');

function validate(schema, params = false, query = false) {
  return (req, res, next) => {
    let validationResult;

    if (params) {
      validationResult = schema.validate(req.params);
    } else if (query) {
      validationResult = schema.validate(req.query);
    } else {
      validationResult = schema.validate(req.body);
    }

    const { error } = validationResult;

    if (error) {
      const errorDetails = error.details.map(detail => ({
        message: detail.message,
        path: detail.path,
      }));

      return ApiError.handleError(new ApiError(400, 'Validation failed', errorDetails), res);
    }

    next();
  };
}

module.exports = validate;
