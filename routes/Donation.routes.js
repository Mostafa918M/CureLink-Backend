const express = require('express');

const { uploadDonationImages } = require('../middlewares/upload'); 
const donationController = require('../controllers/Donation.controller');
const { authenticate } = require('../middlewares/auth');
const DonationValidator = require('../validators/donation.validation');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  uploadDonationImages,
  DonationValidator.createDonation,
  donationController.createDonation
);

module.exports = router;
