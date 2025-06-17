const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const upload = require('../middleware/uploadMiddleware')
const bcrypt = require('bcrypt');

// OTP rate limiter
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many OTP requests. Try again later.'
});

// router.post('/signup', otpLimiter, authController.signup);
router.post('/verify', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/user', requireAuth, authController.getUserData);
router.put('/user/update', requireAuth, authController.updateUserProfile)
router.post('/user/update/verifyEmail', requireAuth, authController.verifyEmailChangeOtp)
router.put('/user/change-password', requireAuth, authController.changePassword);

router.get('/users', requireAuth, authController.getAllUsers); // with filters via query

router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  res.status(200).json({
    message: 'File uploaded successfully',
    file: req.file,
  });
});

router.post('/addUser', requireAuth, upload.single('profile'),authController.adminAddUser);


router.put('/users/:id', requireAuth,upload.none(), authController.editUserByAdmin)

router.put('/users/:id/delete', requireAuth, authController.softDeleteUser);

router.put('/users/:id/status',requireAuth,authController.toggleUserStatus)


module.exports = router;
