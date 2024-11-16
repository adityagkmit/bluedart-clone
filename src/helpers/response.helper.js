class ApiResponse {
  constructor(statusCode, message = 'Success', data = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  static send(res, statusCode, message = 'Success', data = null) {
    res.status(statusCode).json(new ApiResponse(statusCode, message, data));
  }
}

class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    this.message = message;
    this.errors = Array.isArray(errors) ? errors : [errors]; // Ensure `errors` is always an array.

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static handleError(err, res) {
    const { statusCode = 500, message, errors } = err;

    // If `errors` is empty but a stack trace exists, include it for debugging (optional).
    const responseErrors = errors.length > 0 ? errors : [{ message: message || 'An error occurred' }];

    res.status(statusCode).json({
      statusCode,
      success: false,
      data: null,
      errors: responseErrors,
    });
  }
}

module.exports = {
  ApiResponse,
  ApiError,
};
