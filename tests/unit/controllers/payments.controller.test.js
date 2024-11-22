const {
  createPayment,
  getPaymentById,
  getPayments,
  completeCODPayment,
} = require('../../../src/controllers/payments.controller');
const paymentService = require('../../../src/services/payments.service');
const { ApiError } = require('../../../src/helpers/response.helper');

jest.mock('../../../src/services/payments.service');

describe('Payments Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
      query: {},
      user: {},
    };

    mockRes = {
      data: null,
      message: '',
      statusCode: 200,
    };

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

      mockReq.body = { amount: 100, method: 'Card' };
      mockReq.user = { id: 'user1' };

      await createPayment(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockPayment);
      expect(mockRes.message).toBe('Payment created successfully');
      expect(mockRes.statusCode).toBe(201);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during payment creation', async () => {
      paymentService.createPayment.mockRejectedValue(new Error('Error creating payment'));

      mockReq.body = { amount: 100, method: 'Card' };
      mockReq.user = { id: 'user1' };

      await createPayment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: getPaymentById
  describe('getPaymentById', () => {
    it('should retrieve payment by ID successfully', async () => {
      const mockPayment = { id: '1', amount: 100, status: 'Completed' };
      paymentService.getPaymentById.mockResolvedValue(mockPayment);

      mockReq.params.id = '1';
      mockReq.user = { id: 'user1' };

      await getPaymentById(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockPayment);
      expect(mockRes.message).toBe('Payment details retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors when payment is not found', async () => {
      paymentService.getPaymentById.mockResolvedValue(null);

      mockReq.params.id = '1';
      mockReq.user = { id: 'user1' };

      await getPaymentById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should handle errors during payment retrieval', async () => {
      paymentService.getPaymentById.mockRejectedValue(new Error('Error retrieving payment'));

      mockReq.params.id = '1';
      mockReq.user = { id: 'user1' };

      await getPaymentById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: getPayments
  describe('getPayments', () => {
    it('should retrieve a list of payments successfully', async () => {
      const mockPayments = [{ id: '1', amount: 100, status: 'Completed' }];
      paymentService.getPayments.mockResolvedValue(mockPayments);

      mockReq.query.page = '1';
      mockReq.query.limit = '10';
      mockReq.user = { id: 'user1', Roles: [{ name: 'User' }] };

      await getPayments(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockPayments);
      expect(mockRes.message).toBe('Payments retrieved successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during payment retrieval', async () => {
      paymentService.getPayments.mockRejectedValue(new Error('Error retrieving payments'));

      mockReq.query.page = '1';
      mockReq.query.limit = '10';
      mockReq.user = { id: 'user1', Roles: [{ name: 'User' }] };

      await getPayments(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });

  // Test: completeCODPayment
  describe('completeCODPayment', () => {
    it('should complete COD payment successfully', async () => {
      const mockPayment = { id: '1', amount: 100, status: 'Completed' };
      paymentService.completeCODPayment.mockResolvedValue(mockPayment);

      mockReq.params.id = '1';
      mockReq.user = { id: 'user1' };

      await completeCODPayment(mockReq, mockRes, mockNext);

      expect(mockRes.data).toEqual(mockPayment);
      expect(mockRes.message).toBe('Payment status updated successfully');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle errors during COD payment completion', async () => {
      paymentService.completeCODPayment.mockRejectedValue(new Error('Error completing COD payment'));

      mockReq.params.id = '1';
      mockReq.user = { id: 'user1' };

      await completeCODPayment(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    });
  });
});
