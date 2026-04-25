const cron = require('node-cron');
const donationService = require('./donation.service');
const logger = require('../utils/logger');

class JobsService {
  init() {
    cron.schedule('0 0 * * *', async () => {
      logger.info('Running scheduled job: checkExpirations');
      try {
        const result = await donationService.autoCheckExpirations();
        logger.info(`Scheduled job completed: ${result.modifiedCount} donations marked as expired`);
      } catch (error) {
        logger.error('Error in scheduled job checkExpirations:', error);
      }
    });

    logger.info('Background jobs initialized');
  }
}

module.exports = new JobsService();
