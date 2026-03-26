const express = require('express');
const router = express.Router();
const adminDonationController = require('../controllers/admin.donation.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate, authorize('admin', 'superadmin'));
router.get('/', adminDonationController.getAll);
router.get('/pending', adminDonationController.getPending);
router.get('/expiring', adminDonationController.getExpiring);
router.patch('/:id/approve', adminDonationController.approve);
router.patch('/:id/reject', adminDonationController.reject);
router.patch('/:id/status', adminDonationController.changeStatus);
router.delete('/:id', adminDonationController.delete);
router.post('/export', adminDonationController.exportData);

module.exports = router;
