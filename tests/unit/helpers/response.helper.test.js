const { ApiResponse, ApiError } = require('../../../src/helpers/response.helper');

describe('ApiResponse', () => {
  it('should create a successful ApiResponse', () => {
    const response = new ApiResponse(200, 'Success', { data: 'some data' });

    expect(response.statusCode).toBe(200);
    expect(response.success).toBe(true);
    expect(response.message).toBe('Success');
    expect(response.data).toEqual({ data: 'some data' });
  });

  it('should create a failed ApiResponse', () => {
    const response = new ApiResponse(400, 'Bad Request', { error: 'Invalid input' });

    expect(response.statusCode).toBe(400);
    expect(response.success).toBe(false);
    expect(response.message).toBe('Bad Request');
    expect(response.data).toEqual({ error: 'Invalid input' });
  });

  it('should use default message and data when not provided', () => {
    const response = new ApiResponse(200);

    expect(response.statusCode).toBe(200);
    expect(response.success).toBe(true);
    expect(response.message).toBe('Success');
    expect(response.data).toBeNull();
  });

  it('should send the response correctly', () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockData = { key: 'value' };

    ApiResponse.send(mockRes, 200, 'Success', mockData);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 200,
        success: true,
        message: 'Success',
        data: mockData,
      })
    );
  });
});

describe('ApiError', () => {
  it('should create an ApiError with default values', () => {
    const error = new ApiError(500);

    expect(error.statusCode).toBe(500);
    expect(error.success).toBe(false);
    expect(error.message).toBe('Something went wrong');
    expect(error.errors).toEqual([]);
  });

  it('should create an ApiError with custom message and errors', () => {
    const error = new ApiError(400, 'Invalid Input', ['Invalid field'], 'stack trace');

    expect(error.statusCode).toBe(400);
    expect(error.success).toBe(false);
    expect(error.message).toBe('Invalid Input');
    expect(error.errors).toEqual(['Invalid field']);
    expect(error.stack).toBe('stack trace');
  });

  it('should create an ApiError without stack when not provided', () => {
    const error = new ApiError(400, 'Invalid Input', ['Invalid field']);

    expect(error.stack).toBeDefined(); // Ensures stack is captured automatically
  });

  it('should handle error correctly in handleError method', () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const error = new ApiError(400, 'Bad Request', [{ message: 'Invalid input' }]); // Error should be an object with `message` key

    ApiError.handleError(error, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: 400,
      success: false,
      data: null,
      errors: [{ message: 'Invalid input' }], // Ensure the errors array has objects with `message` keys
    });
  });

  it('should handle error correctly with empty errors array', () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const error = new ApiError(500, 'Internal Server Error', []);

    ApiError.handleError(error, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      statusCode: 500,
      success: false,
      data: null,
      errors: [{ message: 'Internal Server Error' }],
    });
  });
});
