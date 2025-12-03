const express = require('express');
const router = express.Router();
const {
  createRegistration,
  sendOtp, 
  getRegistrationById,
  getRegistrationsByRound
} = require('../controllers/registrationController');

// --- ĐỊNH NGHĨA ROUTES ---

// 1. Gửi mã OTP (Bước 1 của quy trình đăng ký)
router.post('/send-otp', sendOtp);

// 2. Tạo đăng ký thi (Bước cuối, cần kèm OTP)
router.post('/', createRegistration);

// 3. Lấy chi tiết một bản đăng ký theo ID
router.get('/:id', getRegistrationById);

// 4. Lấy danh sách đăng ký theo Đợt thi (cho Admin)
router.get('/by-round/:roundId', getRegistrationsByRound);

module.exports = router;
