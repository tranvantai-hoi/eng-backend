const express = require('express');
const router = express.Router();
const {
  createRegistration,
  createOtp, 
  verifyOtp,
  getRegistrationById,
  getRegistrationsByRound
} = require('../controllers/registrationController');

// OTP Routes
router.post('/create-otp', createOtp);
router.get('/verify-otp', verifyOtp);

// Registration Routes
router.post('/register', createRegistration);

// Get Info Routes
// Frontend gọi: /api/registrations/by-id?mssv=...&roundId=...
router.get('/by-id', getRegistrationById);

// Frontend gọi: /api/registrations/by-round/1
router.get('/by-round/:roundId', getRegistrationsByRound);

module.exports = router;