const { Payment, Shipment, sequelize } = require('../models');
const shipmentService = require('./shipments.service');
const ApiError = require('../helpers/response.helper').ApiError;
const { sendPaymentConfirmationEmail } = require('../helpers/email.helper');
const { Op } = require('sequelize');

const createPayment = async (paymentData, user) => {
  const transaction = await sequelize.transaction();

  try {
    const shipment = await Shipment.findByPk(paymentData.shipmentId, { transaction });
    if (!shipment || shipment.user_id !== user.id) {
      throw new ApiError(403, 'Unauthorized to create payment for this shipment');
    }

    const existingPayment = await Payment.findOne({
      where: { shipment_id: paymentData.shipmentId },
      transaction,
    });
    if (existingPayment) {
      throw new ApiError(400, 'Payment already exists for this shipment');
    }

    const payment = await Payment.create(
      {
        shipment_id: paymentData.shipmentId,
        user_id: user.id,
        amount: shipment.price,
        transaction_details: paymentData.transactionDetails,
        method: paymentData.method || 'Online',
        status: 'Pending',
      },
      { transaction }
    );

    if (payment.method === 'COD') {
      await shipmentService.updateShipmentStatus(
        {
          shipmentId: paymentData.shipmentId,
          status: 'In Transit',
        },
        user,
        transaction
      );
      await transaction.commit();
      return payment;
    }

    // Process the payment transaction (mock)
    const isTransactionSuccessful = await processTransaction(payment);

    if (isTransactionSuccessful) {
      payment.status = 'Completed';
      await payment.save({ transaction });

      await shipmentService.updateShipmentStatus(
        {
          shipmentId: paymentData.shipmentId,
          status: 'In Transit',
        },
        user,
        transaction
      );
      await sendPaymentConfirmationEmail(user.email, {
        userName: user.name,
        shipmentId: shipment.id,
        amount: shipment.price,
        method: payment.method,
        status: payment.status,
      });
    } else {
      payment.status = 'Failed';
      await payment.save({ transaction });
      throw new ApiError(400, 'Payment transaction failed');
    }

    await transaction.commit();
    return payment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Mock function to simulate payment transaction processing
const processTransaction = async payment => {
  console.log(payment);
  return true;
};

const completeCODPayment = async (paymentId, user) => {
  const transaction = await sequelize.transaction();
  try {
    const payment = await Payment.findByPk(paymentId, { transaction });
    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    if (payment.method !== 'COD') {
      throw new ApiError(400, 'Payment is not COD');
    }

    const shipment = await Shipment.findByPk(payment.shipment_id, { transaction });
    if (!shipment || shipment.delivery_agent_id !== user.id) {
      throw new ApiError(403, 'Unauthorized to complete payment for this shipment');
    }

    if (payment.status !== 'Pending') {
      throw new ApiError(400, 'Payment is not pending');
    }

    payment.status = 'Completed';
    await payment.save({ transaction });

    await shipmentService.updateShipmentStatus(
      {
        shipmentId: payment.shipment_id,
        status: 'Delivered',
      },
      user,
      transaction
    );

    await transaction.commit();
    return payment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getPaymentById = async (id, user) => {
  const payment = await Payment.findByPk(id, {
    include: [{ model: Shipment, as: 'Shipment' }],
  });

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  if (payment.user_id !== user.id && !user.Roles.some(role => role.name === 'Admin')) {
    throw new ApiError(403, 'Access denied');
  }

  return payment;
};

const getPayments = async (data, user) => {
  const { page = 1, limit = 10, ...filters } = data;

  if (!user.Roles.some(role => role.name === 'Admin')) {
    filters.user_id = user.id;
  }

  console.log(data);

  const whereConditions = {};

  // Dynamically construct filter conditions
  for (const [key, value] of Object.entries(filters)) {
    if (Object.keys(Payment.rawAttributes).includes(key)) {
      whereConditions[key] = { [Op.eq]: value };
    }
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Payment.findAndCountAll({
    where: whereConditions,
    include: [{ model: Shipment, as: 'Shipment', attributes: ['id', 'status'] }],
    offset,
    limit: parseInt(limit),
    order: [['created_at', 'DESC']],
  });

  return {
    totalItems: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    payments: rows,
  };
};

module.exports = {
  createPayment,
  completeCODPayment,
  getPaymentById,
  getPayments,
};
