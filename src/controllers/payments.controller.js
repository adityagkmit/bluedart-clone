const paymentService = require('../services/payments.service');
const { ApiResponse, ApiError } = require('../helpers/response.helper');

exports.createPayment = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body, req.user);
    ApiResponse.send(res, 201, 'Payment created and processed successfully', payment);
  } catch (error) {
    console.log(error);
    ApiError.handleError(error, res);
  }
};

exports.completeCODPayment = async (req, res) => {
  try {
    const payment = await paymentService.completeCODPayment(req.params.id, req.user);
    ApiResponse.send(res, 200, 'Payment status updated successfully', payment);
  } catch (error) {
    ApiError.handleError(error, res);
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentById(id, req.user);
    ApiResponse.send(res, 200, 'Payment details retrieved successfully', payment);
  } catch (error) {
    ApiError.handleError(error, res);
  }
};
