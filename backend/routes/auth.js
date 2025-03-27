const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  verifyEmail,
  resendVerificationEmail,
  resetPasswordDirect,
  deleteAccount,
  updateRoleToAdmin
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerificationEmail);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/reset-password-direct', resetPasswordDirect);
router.delete('/delete-account', deleteAccount);
router.put('/update-role', updateRoleToAdmin);

module.exports = router;