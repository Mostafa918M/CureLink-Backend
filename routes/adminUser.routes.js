'use strict';

const express = require('express');
const adminUserController = require('../controllers/adminUser.controller');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// All routes require admin or superadmin access
router.use(authenticate);
router.use(authorize('admin', 'superadmin'));

router.get('/', adminUserController.listUsers);
router.post('/export', adminUserController.exportUsers);
router.get('/:id', adminUserController.getUserDetails);
router.patch('/:id/role', adminUserController.changeUserRole);
router.patch('/:id/status', adminUserController.toggleUserStatus);
router.delete('/:id', adminUserController.deleteUser);
router.get('/:id/activity', adminUserController.getUserActivity);

module.exports = router;
