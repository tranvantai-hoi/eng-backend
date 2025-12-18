const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {
  createRegistration,
  createOtp, 
  verifyOtp,
  getRegistrationById,
  getRegistrationsByRound,
  updateStatus,
  changeRound,
  deleteRegistration,
  importScores
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

router.put('/status', updateStatus);   // PUT /api/registrations/status

router.put('/changeround', changeRound);

router.delete('/', deleteRegistration);

router.post('/import-scores', upload.single('file'), importScores);

module.exports = router;