const paymentService = require('../services/payments.service');
const { ApiError } = require('../helpers/response.helper');

// Create Payment
const createPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.createPayment(req.body, req.user);
    res.data = payment;
    res.message = 'Payment created successfully';
    res.statusCode = 201;
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Get Payment by ID
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user);
    if (!payment) {
      return next(new ApiError(404, 'Payment not found'));
    }
    res.data = payment;
    res.message = 'Payment details retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Get Payments (Paginated)
const getPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getPayments(req.query, req.user);
    res.data = payments;
    res.message = 'Payments retrieved successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Complete COD Payment
const completeCODPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.completeCODPayment(req.params.id, req.user);
    res.data = payment;
    res.message = 'Payment status updated successfully';
    next();
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

module.exports = {
  createPayment,
  getPaymentById,
  getPayments,
  completeCODPayment,
};
