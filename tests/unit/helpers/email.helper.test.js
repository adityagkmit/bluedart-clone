const {
  sendEmail,
  sendOtpEmail,
  sendPaymentConfirmationEmail,
  sendShipmentStatusUpdateEmail,
} = require('../../../src/helpers/email.helper');
const transporter = require('../../../src/utils/email');
const ejs = require('ejs');
const path = require('path');

jest.mock('../../../src/utils/email', () => ({
  sendMail: jest.fn(),
}));

jest.mock('ejs', () => ({
  renderFile: jest.fn(),
}));

describe('Email Helper', () => {
  const mockEmail = 'test@example.com';
  const mockOtp = '123456';
  const mockPaymentData = {
    userName: 'John Doe',
    shipmentId: 'SH12345',
    amount: 100.0,
    method: 'Credit Card',
    status: 'Success',
  };
  const mockStatusData = {
    userName: 'John Doe',
    shipmentId: 'SH12345',
    status: 'Delivered',
  };
  const mockTemplatePath = path.join(__dirname, '../../../src/templates');

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOtpEmail', () => {
    it('should send an OTP email successfully', async () => {
      transporter.sendMail.mockResolvedValue({ messageId: 'mock-message-id' });

      await sendOtpEmail(mockEmail, mockOtp);

      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: mockEmail,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${mockOtp}. It will expire in 1 minute.`,
      });
    });

    it('should throw an error if email sending fails', async () => {
      const mockError = new Error('Failed to send email');
      transporter.sendMail.mockRejectedValue(mockError);

      await expect(sendOtpEmail(mockEmail, mockOtp)).rejects.toThrow('Failed to send email');
    });
  });

  describe('sendEmail', () => {
    it('should send a custom email with rendered template', async () => {
      const mockHtml = '<html>Mock Email Content</html>';
      const mockData = { name: 'John' };

      ejs.renderFile.mockResolvedValue(mockHtml);
      transporter.sendMail.mockResolvedValue({ messageId: 'mock-message-id' });

      await sendEmail({ to: mockEmail, subject: 'Test Email', template: 'test-template', data: mockData });

      expect(ejs.renderFile).toHaveBeenCalledWith(`${mockTemplatePath}/test-template.ejs`, mockData);
      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: mockEmail,
        subject: 'Test Email',
        html: mockHtml,
        attachments: [],
      });
    });

    it('should throw an error if rendering the template fails', async () => {
      const mockError = new Error('Template rendering failed');
      ejs.renderFile.mockRejectedValue(mockError);

      await expect(
        sendEmail({ to: mockEmail, subject: 'Test Email', template: 'test-template' })
      ).rejects.toThrow('Template rendering failed');
    });
  });

  describe('sendPaymentConfirmationEmail', () => {
    it('should send a payment confirmation email successfully', async () => {
      const mockHtml = '<html>Payment Confirmation Email</html>';
      ejs.renderFile.mockResolvedValue(mockHtml);
      transporter.sendMail.mockResolvedValue({ messageId: 'mock-message-id' });

      await sendPaymentConfirmationEmail(mockEmail, mockPaymentData);

      expect(ejs.renderFile).toHaveBeenCalledWith(
        `${mockTemplatePath}/payment-confirmation-email.ejs`,
        expect.objectContaining(mockPaymentData)
      );
      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: mockEmail,
        subject: 'Payment Confirmation',
        html: mockHtml,
      });
    });

    it('should throw an error if sending payment email fails', async () => {
      const mockError = new Error('Failed to send email');
      ejs.renderFile.mockResolvedValue('<html>Payment Confirmation Email</html>');
      transporter.sendMail.mockRejectedValue(mockError);

      await expect(sendPaymentConfirmationEmail(mockEmail, mockPaymentData)).rejects.toThrow(
        'Failed to send email'
      );
    });
  });

  describe('sendShipmentStatusUpdateEmail', () => {
    it('should send a shipment status update email successfully', async () => {
      const mockHtml = '<html>Shipment Status Update Email</html>';
      ejs.renderFile.mockResolvedValue(mockHtml);
      transporter.sendMail.mockResolvedValue({ messageId: 'mock-message-id' });

      await sendShipmentStatusUpdateEmail(mockEmail, mockStatusData);

      expect(ejs.renderFile).toHaveBeenCalledWith(
        `${mockTemplatePath}/shipment-status-update-email.ejs`,
        expect.objectContaining(mockStatusData)
      );
      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_USER,
        to: mockEmail,
        subject: `Shipment Status Update: ${mockStatusData.status}`,
        html: mockHtml,
      });
    });

    it('should throw an error if sending shipment email fails', async () => {
      const mockError = new Error('Failed to send email');
      ejs.renderFile.mockResolvedValue('<html>Shipment Status Update Email</html>');
      transporter.sendMail.mockRejectedValue(mockError);

      await expect(sendShipmentStatusUpdateEmail(mockEmail, mockStatusData)).rejects.toThrow(
        'Failed to send email'
      );
    });
  });
});
