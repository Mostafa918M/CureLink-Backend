const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/auth');

router.post("/register", authValidator.register, authController.register);
router.post("/verify-email", authValidator.verifyEmail, authController.verifyEmail);
router.post("/resend-verification", authValidator.resendEmailVerification, authController.resendEmailVerification);
router.post("/login", authValidator.login, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authenticate, authController.logout);
router.post("/logout-all",authenticate, authController.logoutAll);
router.get("/me", authenticate, authController.getMe);

module.exports = router;
