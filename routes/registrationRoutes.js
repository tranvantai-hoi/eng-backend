const express = require('express');
const router = express.Router();
const {
  createRegistration,
  sendOtp,
  getRoundActive, // Import hàm mới
  getRegistrationById,
  getRegistrationsByRound
} = require('../controllers/registrationController');

// --- ĐỊNH NGHĨA ROUTES ---

// Route lấy đợt thi Active (Frontend đang gọi /examRoundRoutes/getRoundActive)
// Tùy vào cách bạn mount ở server.js mà URL sẽ khác nhau. 
// Tôi đặt tên route này là /getRoundActive để dễ map.
router.get('/getRoundActive', getRoundActive);

// Route gửi OTP
router.post('/send-otp', sendOtp); // Lưu ý: Frontend đang gọi /registrations/send-otp hoặc /send-otp tùy api.js

// Route đăng ký
router.post('/register', createRegistration); // Frontend gọi /register

// Các route khác
router.get('/:id', getRegistrationById);
router.get('/by-round/:roundId', getRegistrationsByRound);

module.exports = router;
