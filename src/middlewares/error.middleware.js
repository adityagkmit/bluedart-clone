const { ApiError } = require('../helpers/response.helper');

// Global error handler middleware
const errorHandler = (err, req, res) => {
  if (err instanceof ApiError) {
    const { statusCode, message, errors } = err;
    return res.status(statusCode).json({
      statusCode,
      success: false,
      message,
      errors,
    });
  }

  console.error(err.stack); // Log stack trace for debugging
  res.status(500).json({
    statusCode: 500,
    success: false,
    message: 'Internal Server Error',
    errors: [{ message: err.message || 'An unexpected error occurred' }],
  });
};

module.exports = errorHandler;
