require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { globalError, handleNotFound } = require('./middlewares/globalErrorHandler');

// Routes
const requestRoutes  = require('./routes/request.routes');
const authRoutes     = require('./routes/auth.routes');
const donationRoutes = require('./routes/Donation.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const reportRoutes    = require('./routes/report.routes');
const adminDashboardRoutes = require('./routes/adminDashboard.routes');
const adminUserRoutes = require('./routes/adminUser.routes');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api/v1/requests',   requestRoutes);
app.use('/api/v1/auth',       authRoutes);
app.use('/api/v1/donations',  donationRoutes);
app.use('/api/v1/analytics',  analyticsRoutes);
app.use('/api/v1/reports',    reportRoutes);
app.use('/api/v1/admin/dashboard', adminDashboardRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use(handleNotFound);
app.use(globalError);

module.exports = app;
