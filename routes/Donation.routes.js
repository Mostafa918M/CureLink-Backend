const express = require('express');

const { uploadDonationImages } = require('../middlewares/upload');
const donationController = require('../controllers/Donation.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const DonationValidator = require('../validators/donation.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin', 'superadmin', 'institution'), donationController.getAll);

router.get('/:id', authorize('admin', 'superadmin', 'institution'), donationController.getOne);

router.post('/', uploadDonationImages, DonationValidator.createDonation, donationController.create);

router.patch(
  '/:id',
  uploadDonationImages,
  DonationValidator.updateDonation,
  donationController.update
);

router.delete('/:id', donationController.delete);

module.exports = router;
