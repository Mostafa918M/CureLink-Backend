const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const notificationValidator = require('../validators/notification.validator');
const router = express.Router();


router.get('/', authenticate ,notificationController.getAll);   
router.get('/unread-count', authenticate ,notificationController.unreadCountNotification);   
router.patch('/read-all',authenticate , notificationController.markAllAsRead);   
router.get('/deleted', authenticate, authorize("superadmin","admin"),notificationController.getAllDeleted)  


router.get('/:id', authenticate ,notificationValidator.validateObjectId,notificationController.getOne);    
router.patch('/:id/read',authenticate ,notificationValidator.validateObjectId,notificationController.markOneAsRead);   
router.delete('/:id', authenticate, authorize("superadmin","admin"),notificationValidator.validateObjectId,notificationController.deleteOne);  
 router.patch('/restore/:id',authenticate, authorize("superadmin","admin"),notificationController.restoreOneNotification)   


router.delete('/user/:userID', authenticate, authorize("superadmin","admin"),notificationValidator.validateObjectId,notificationController.deleteAll);       

 

module.exports = router;
