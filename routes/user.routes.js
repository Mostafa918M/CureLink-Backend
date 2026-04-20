const express = require('express');
const { authenticate } = require('../middlewares/auth');
const userController = require('../controllers/user.controller');
const { uploadInstitutionLogo } = require('../middlewares/multer');
const userValidator = require('../validators/user.validator');
 const router = express.Router();


router.get('/profile',authenticate,userController.getOne);    // Get current user profile
router.patch('/profile',authenticate,userValidator.updateProfile,userController.update);   //Update current user profile

router.post('/upload-avatar',authenticate ,uploadInstitutionLogo, userController.uploadPicture);   //Upload profile picture
router.delete('/avatar',authenticate, userController.delete);      //Delete profile picture

router.patch('/change-password',authenticate,userValidator.changePassword,userController.changePassword)

router.get('/sessions',authenticate,userController.activeSessions )                 //Get active sessions
router.delete('/sessions/:id',authenticate,userController.deleteSession)        //Revoke specific session
router.delete('/sessions',authenticate,userController.deleteAllSessions)             // Revoke all sessions


module.exports = router;
