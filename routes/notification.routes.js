const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const notificationValidator = require('../validators/notification.validator');
const router = express.Router();



router.get('/:id', authenticate ,notificationValidator.validateObjectId,notificationController.getOne);     //Get single notification
router.get('/', authenticate ,notificationController.getAll);   //Get user's notifications

router.patch('/:id/read',authenticate ,notificationValidator.validateObjectId,notificationController.markOneAsRead);   //Mark notification as read
router.patch('/read-all',authenticate , notificationController.markAllAsRead);   //Mark all as read

router.get('/unread-count', authenticate ,notificationController.unreadCountNotification);     //Get unread count


router.delete('/:id', authenticate, authorize("superadmin","admin"),notificationValidator.validateObjectId,notificationController.deleteOne);     //Delete notification
router.delete('/:userID', authenticate, authorize("superadmin","admin"),notificationValidator.validateObjectId,notificationController.deleteAll);       //Delete all notifications for each user

router.get('/deleted', authenticate, authorize("superadmin","admin"),notificationController.getAllDeleted)  ///get all admin's deleted notification 
router.patch('/restore/:id',authenticate, authorize("superadmin","admin"),notificationController.restoreOneNotification)   
// Restore a single notification => Admin can restore only notifications they deleted && Superadmin can restore any deleted notification


module.exports = router;
