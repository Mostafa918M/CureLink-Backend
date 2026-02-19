require('dotenv').config();
const app = require('./app');
const chalk = require('chalk');
const logger = require('./utils/logger');
const connectDB = require('./config/database');

// console.log('MONGO_URI:', process.env.MONGO_URI);
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.bgCyan.white.bold(`  Server is running on port ${PORT}  `));
  logger.info(`Server started on port ${PORT}`);
});
