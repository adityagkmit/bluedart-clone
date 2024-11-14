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
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static handleError(err, res) {
    const { statusCode = 500, message, errors } = err;
    res.status(statusCode).json(new ApiError(statusCode, message, errors));
  }
}

module.exports = {
  ApiResponse,
  ApiError,
};
