const fs = require('fs');
const path = require('path');
const logger = require('../helpers/logger.helper');

const initializeSchedulers = () => {
  logger.info('Initializing schedulers...');
  const schedulerFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.scheduler.js'));

  schedulerFiles.forEach(file => {
    const scheduler = require(path.join(__dirname, file));
    if (typeof scheduler === 'object') {
      Object.values(scheduler).forEach(fn => {
        if (typeof fn === 'function') {
          fn(); // Call the scheduler function
          logger.info(`Scheduler ${file} initialized.`);
        }
      });
    }
  });
};

module.exports = {
  initializeSchedulers,
};
