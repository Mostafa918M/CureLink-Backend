require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { globalError, handleNotFound } = require('./middlewares/globalErrorHandler');
//import routes here
const userRoutes = require('./routes/user.routes');

// Routes
const requestRoutes = require('./routes/request.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminInstitutionRoutes = require('./routes/admin.institution.routes');
const institutionRoutes = require('./routes/institution.routes');
const authRoutes = require('./routes/auth.routes');
const donationRoutes = require('./routes/donation.routes');
const adminDonationRoutes = require('./routes/admin.donation.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const reportRoutes = require('./routes/report.routes');
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

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/requests', requestRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin/institutions', adminInstitutionRoutes);
app.use('/api/v1/admin/donations', adminDonationRoutes);
app.use('/api/v1/institutions', institutionRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/admin/dashboard', adminDashboardRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use(handleNotFound);
app.use(globalError);

module.exports = app;
