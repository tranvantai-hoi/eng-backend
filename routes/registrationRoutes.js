const express = require('express');
const router = express.Router();
const {
  createRegistration,
  sendOtp, 
  getRegistrationById,
  getRegistrationsByRound
} = require('../controllers/registrationController');

// --- ĐỊNH NGHĨA ROUTES ---

// 1. Gửi mã OTP
// Frontend gọi: /registrations/send-otp
// Định nghĩa: /registrations/send-otp (Khớp 100%)
router.post('/send-otp', sendOtp);

// 2. Tạo đăng ký thi
// Frontend gọi: /register
// Định nghĩa: /register (Khớp 100%)
router.post('/register', createRegistration);

// 3. Các route phụ (Admin hoặc xem chi tiết)
router.get('/registrations/:id', getRegistrationById);
router.get('/registrations/by-round/:roundId', getRegistrationsByRound);

module.exports = router;
