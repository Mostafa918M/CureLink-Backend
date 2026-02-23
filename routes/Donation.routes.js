const express = require('express');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const donationController = require('../controllers/Donation.controller');
const { authenticate } = require('../middlewares/auth');
const { createDonationValidator } = require('../validators/donation.validation');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  upload.array('images', 5),
  createDonationValidator,
  donationController.createDonation
);

module.exports = router;
