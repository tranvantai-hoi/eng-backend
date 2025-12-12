const express = require('express');
const router = express.Router();
const {
  createRegistration,
  createOtp, 
  getRegistrationById,
  getRegistrationsByRound
} = require('../controllers/registrationController');

// --- ĐỊNH NGHĨA ROUTES ---

// 1. Gửi mã OTP
// Frontend gọi: /otp/send-otp
// Định nghĩa: /otp/send-otp (Khớp 100%)
router.post('/create-otp', createOtp);

// 2. Tạo đăng ký thi
// Frontend gọi: /register
// Định nghĩa: /register (Khớp 100%)
router.post('/register', createRegistration);

// 3. Các route phụ (Admin hoặc xem chi tiết)
router.get('/registrations/:id', getRegistrationById);
router.get('/registrations/by-round/:roundId', getRegistrationsByRound);

module.exports = router;
