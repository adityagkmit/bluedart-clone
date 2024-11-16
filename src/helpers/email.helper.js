const transporter = require('../utils/email');
const ejs = require('ejs');
const path = require('path');

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 1 minute.`,
  };

  await transporter.sendMail(mailOptions);
};

const sendPaymentConfirmationEmail = async (to, paymentData) => {
  const templatePath = path.join(__dirname, '../templates/payment-confirmation-email.ejs');

  const html = await ejs.renderFile(templatePath, {
    userName: paymentData.userName,
    shipmentId: paymentData.shipmentId,
    paymentAmount: paymentData.amount,
    paymentMethod: paymentData.method,
    paymentStatus: paymentData.status,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Payment Confirmation',
    html,
  };

  await transporter.sendMail(mailOptions);
};

const sendShipmentStatusUpdateEmail = async (to, statusData) => {
  const templatePath = path.join(__dirname, '../templates/shipment-status-update-email.ejs');

  const html = await ejs.renderFile(templatePath, {
    userName: statusData.userName,
    shipmentId: statusData.shipmentId,
    shipmentStatus: statusData.status,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `Shipment Status Update: ${statusData.status}`,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendPaymentConfirmationEmail, sendShipmentStatusUpdateEmail };
