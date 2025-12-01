const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// Route gửi OTP: POST /api/registrations/send-otp
router.post('/send-otp', registrationController.sendOtp);

// Route đăng ký: POST /api/registrations
router.post('/', registrationController.register);

// Route lịch sử
router.get('/history/:mssv', registrationController.getHistory);

module.exports = router;
