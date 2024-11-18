const cron = require('node-cron');
const { sendShipmentReminders } = require('../services/shipments.service');
const logger = require('../helpers/logger.helper');

// Scheduler for sending shipment reminders
const scheduleShipmentReminders = () => {
  cron.schedule('* 5 * * *', async () => {
    try {
      logger.info('Running shipment reminder task...');
      await sendShipmentReminders();
      logger.info('Shipment reminders sent successfully.');
    } catch (error) {
      logger.error('Error occurred while sending shipment reminders:', error);
    }
  });
};

module.exports = {
  scheduleShipmentReminders,
};
