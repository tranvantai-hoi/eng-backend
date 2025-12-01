const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Route gửi mã OTP (Bước 1)
router.post('/send-otp', registrationController.sendOtp);

// Route đăng ký/xác thực OTP (Bước 2)
router.post('/', registrationController.register);

// Route lấy lịch sử (nếu cần)
router.get('/history/:mssv', registrationController.getHistory);

module.exports = router;
