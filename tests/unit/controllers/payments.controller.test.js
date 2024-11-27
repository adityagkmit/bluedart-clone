const {
  createPayment,
  getPaymentById,
  getPayments,
  completeCODPayment,
} = require('../../../src/controllers/payments.controller');

const paymentService = require('../../../src/services/payments.service');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('../../../src/services/payments.service');

describe('Payment Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { params: {}, query: {}, body: {}, user: {} };
    mockRes = { data: null, message: null, statusCode: null };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test: createPayment
  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const mockPayment = { id: '1', amount: 100, status: 'Pending' };
      paymentService.createPayment.mockResolvedValue(mockPayment);

      mockReq.body = { amount: 100 };
      mockReq.user = { id: 'user1' };

      await createPayment(mockReq, mockRes, mockNext);

      expect(paymentService.createPayment).toHaveBeenCalledWith(mockReq.body, mockReq.user);
      expect(mockRes.data).toEqual(mockPayment);
      expect(mockRes.message).toBe('Payment created successfully');
      expect(mockRes.statusCode).toBe(201);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during payment creation', async () => {
      const errorMessage = 'Invalid payment details';
      paymentService.createPayment.mockRejectedValue(new Error(errorMessage));

      await createPayment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(errorMessage);
    });
  });

  // Test: getPaymentById
  describe('getPaymentById', () => {
    it('should retrieve a payment successfully', async () => {
      const mockPayment = { id: '1', amount: 100, status: 'Completed' };
      paymentService.getPaymentById.mockResolvedValue(mockPayment);

      mockReq.params.id = '1';
      mockReq.user = { id: 'user1' };

      await getPaymentById(mockReq, mockRes, mockNext);

      expect(paymentService.getPaymentById).toHaveBeenCalledWith(mockReq.params.id, mockReq.user);
      expect(mockRes.data).toEqual(mockPayment);
      expect(mockRes.message).toBe('Payment details retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when the payment is not found', async () => {
      paymentService.getPaymentById.mockResolvedValue(null);

      mockReq.params.id = '1';
      mockReq.user = { id: 'user1' };

      await getPaymentById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Payment not found');
    });

    it('should handle unexpected errors', async () => {
      const errorMessage = 'Database error';
      paymentService.getPaymentById.mockRejectedValue(new Error(errorMessage));

      await getPaymentById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(errorMessage);
    });
  });

  // Test: getPayments
  describe('getPayments', () => {
    it('should retrieve payments successfully', async () => {
      const mockPayments = [{ id: '1' }, { id: '2' }];
      paymentService.getPayments.mockResolvedValue(mockPayments);

      mockReq.query = { page: 1, limit: 10 };
      mockReq.user = { id: 'user1' };

      await getPayments(mockReq, mockRes, mockNext);

      expect(paymentService.getPayments).toHaveBeenCalledWith(mockReq.query, mockReq.user);
      expect(mockRes.data).toEqual(mockPayments);
      expect(mockRes.message).toBe('Payments retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during payments retrieval', async () => {
      const errorMessage = 'Error retrieving payments';
      paymentService.getPayments.mockRejectedValue(new Error(errorMessage));

      await getPayments(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(errorMessage);
    });
  });

  // Test: completeCODPayment
  describe('completeCODPayment', () => {
    it('should update COD payment status successfully', async () => {
      const mockUpdatedPayment = { id: '1', status: 'Completed' };
      paymentService.completeCODPayment.mockResolvedValue(mockUpdatedPayment);

      mockReq.params.id = '1';
      mockReq.user = { id: 'user1' };

      await completeCODPayment(mockReq, mockRes, mockNext);

      expect(paymentService.completeCODPayment).toHaveBeenCalledWith(mockReq.params.id, mockReq.user);
      expect(mockRes.data).toEqual(mockUpdatedPayment);
      expect(mockRes.message).toBe('Payment status updated successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during COD payment update', async () => {
      const errorMessage = 'Error updating payment status';
      paymentService.completeCODPayment.mockRejectedValue(new Error(errorMessage));

      await completeCODPayment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(errorMessage);
    });
  });
});
