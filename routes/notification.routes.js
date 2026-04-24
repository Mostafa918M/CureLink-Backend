const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const notificationValidator = require('../validators/notification.validator');
const router = express.Router();



router.get('/:id', authenticate ,notificationValidator.validateObjectId,notificationController.getOne);    
router.get('/', authenticate ,notificationController.getAll);   

router.patch('/:id/read',authenticate ,notificationValidator.validateObjectId,notificationController.markOneAsRead);   
router.patch('/read-all',authenticate , notificationController.markAllAsRead);   

router.get('/unread-count', authenticate ,notificationController.unreadCountNotification);   


router.delete('/:id', authenticate, authorize("superadmin","admin"),notificationValidator.validateObjectId,notificationController.deleteOne);    
router.delete('/:userID', authenticate, authorize("superadmin","admin"),notificationValidator.validateObjectId,notificationController.deleteAll);       

router.get('/deleted', authenticate, authorize("superadmin","admin"),notificationController.getAllDeleted)  
router.patch('/restore/:id',authenticate, authorize("superadmin","admin"),notificationController.restoreOneNotification)   


module.exports = router;
