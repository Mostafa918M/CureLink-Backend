require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { globalError, handleNotFound } = require('./middlewares/globalErrorHandler');
//import routes here
const authRoutes = require('./routes/auth.routes');
<<<<<<< HEAD
const { swaggerUi, specs } = require('./config/swagger');
=======
const donationRoutes = require('./routes/Donation.routes');
>>>>>>> medicineAndDonationSchemas

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/health', (req, res) => {
  res.status(200).send('OK');
});

// TODO: Add your routes here
<<<<<<< HEAD
app.use('/api/v1/auth', authRoutes);

=======
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
>>>>>>> medicineAndDonationSchemas
app.use(handleNotFound);
app.use(globalError);

module.exports = app;
