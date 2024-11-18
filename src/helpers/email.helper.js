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

const sendEmail = async ({ to, subject, template, data = {}, attachments = [] }) => {
  try {
    // Path to EJS template
    const templatePath = path.join(__dirname, '../templates', `${template}.ejs`);

    // Render the EJS template with provided data
    const htmlContent = await ejs.renderFile(templatePath, data);

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
      attachments, // Optional attachments
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
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

module.exports = { sendEmail, sendOtpEmail, sendPaymentConfirmationEmail, sendShipmentStatusUpdateEmail };
