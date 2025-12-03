const express = require('express');
const router = express.Router();
const {
  createRegistration,
  sendOtp, // Import hàm mới
  getRegistrationById,
  getRegistrationsByRound
} = require('../controllers/registrationController');

router.post('/', createRegistration); // Đăng ký (kèm OTP)
router.post('/send-otp', sendOtp);    // Route mới để gửi OTP

// ... các route khác giữ nguyên
router.get('/:id', getRegistrationById);
router.get('/by-round/:roundId', getRegistrationsByRound);

// Route đăng ký mới
router.post('/', createRegistration);

// Route lấy chi tiết đăng ký
router.get('/:id', getRegistrationById);

// Route lấy danh sách đăng ký theo đợt thi
router.get('/by-round/:roundId', getRegistrationsByRound);

module.exports = router;
