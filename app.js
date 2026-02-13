require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { globalError, handleNotFound } = require('./middlewares/globalErrorHandler');
//import routes here
const authRoutes = require('./routes/auth.routes');
const donationRoutes = require('./routes/Donation.routes');

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());

app.use('/health', (req, res) => {
  res.status(200).send('OK');
});

// TODO: Add your routes here
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use(handleNotFound);
app.use(globalError);

module.exports = app;
