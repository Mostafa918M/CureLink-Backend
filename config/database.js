const chalk = require('chalk');
const mongoose = require('mongoose');
const logger = require('../utils/logger');


const URI = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    const conn =await mongoose.connect(URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }); 
    console.log(chalk.bgGreen.white.bold('  MongoDB connected '));
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {  
      console.error(chalk.bgRed.white.bold('  MongoDB connection error:'  ));
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log(chalk.bgYellow.white.bold('  MongoDB disconnected due to application termination  '));
      logger.info('MongoDB disconnected due to application termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(chalk.bgRed.white.bold('  MongoDB connection failed:  '));
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
