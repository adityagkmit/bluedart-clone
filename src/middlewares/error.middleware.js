const { ApiError } = require('../helpers/response.helper');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    const { statusCode, message, errors } = err;
    return res.status(statusCode).json({
      statusCode,
      success: false,
      message,
      errors: errors.length ? errors : undefined,
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('Error stack:', err.stack);
  }

  res.status(500).json({
    statusCode: 500,
    success: false,
    message: 'Internal Server Error',
    errors: [{ message: err.message || 'An unexpected error occurred' }],
  });
};

module.exports = errorHandler;
