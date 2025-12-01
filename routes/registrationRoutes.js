const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

// POST /api/registrations/send-otp
router.post('/send-otp', registrationController.sendOtp);

// POST /api/registrations (Xác thực & Đăng ký)
router.post('/', registrationController.register);

// GET /api/registrations/history/:mssv
router.get('/history/:mssv', registrationController.getHistory);

module.exports = router;
