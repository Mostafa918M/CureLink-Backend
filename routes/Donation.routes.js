// routes/donation.routes.js
const express = require('express');
const upload = require('../middlewares/upload');
const donationController = require('../controllers/Donation.controller');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate.authenticate);
router.get('/my-donations', donationController.getMyDonations);
router.get('/available', donationController.getAvailableDonations);
router.get('/matched', donationController.getMatchedDonations);
router.get('/stats', authorize.authorize('admin'), donationController.getDonationStats);//admin
router.get('/:id', donationController.getDonation);

router.post('/', upload.array('images', 5), donationController.createDonation);
router.patch('/:id', upload.array('images', 5), donationController.updateDonation);
router.delete('/:id', donationController.deleteDonation);

router.patch('/:id/approve', authorize.authorize('admin'), donationController.approveDonation);//admin
router.patch('/:id/reject', authorize.authorize('admin'), donationController.rejectDonation);//admin
router.patch('/:id/match', authorize.authorize('admin'), donationController.matchDonation);//admin
router.patch('/:id/delivery', donationController.updateDelivery);

router.get('/', donationController.getAllDonations);

module.exports = router;
