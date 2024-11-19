const paymentService = require('../services/payments.service');
const { ApiResponse, ApiError } = require('../helpers/response.helper');

const createPayment = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body, req.user);
    ApiResponse.send(res, 201, 'Payment created and processed successfully', payment);
  } catch (error) {
    console.log(error);
    ApiError.handleError(error, res);
  }
};

const completeCODPayment = async (req, res) => {
  try {
    const payment = await paymentService.completeCODPayment(req.params.id, req.user);
    ApiResponse.send(res, 200, 'Payment status updated successfully', payment);
  } catch (error) {
    ApiError.handleError(error, res);
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentById(id, req.user);
    ApiResponse.send(res, 200, 'Payment details retrieved successfully', payment);
  } catch (error) {
    ApiError.handleError(error, res);
  }
};

const getPayments = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.query;

    // If the user is not an Admin, restrict results to their own payments
    if (!req.user.Roles.some(role => role.name === 'Admin')) {
      filters.user_id = req.user.id;
    }

    const payments = await paymentService.getPayments(filters, page, limit);
    return ApiResponse.send(res, 200, 'Payments retrieved successfully', payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return ApiError.handleError(new ApiError(400, 'An error occurred while fetching payments.'), res);
  }
};

module.exports = {
  createPayment,
  completeCODPayment,
  getPaymentById,
  getPayments,
};
