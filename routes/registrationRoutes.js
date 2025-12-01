const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Route 1: Gửi mã OTP
// POST /api/registrations/send-otp
router.post('/send-otp', registrationController.sendOtp);

// Route 2: Xác thực OTP và Đăng ký
// POST /api/registrations
router.post('/', registrationController.register);

// Route 3: Lịch sử (nếu cần)
router.get('/history/:mssv', registrationController.getHistory);

module.exports = router;
