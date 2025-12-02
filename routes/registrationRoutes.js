const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getRegistrationById,
  getRegistrationsByRound
} = require('../controllers/registrationController');

// Route đăng ký mới
router.post('/', createRegistration);

// Route lấy chi tiết đăng ký
router.get('/:id', getRegistrationById);

// Route lấy danh sách đăng ký theo đợt thi
router.get('/by-round/:roundId', getRegistrationsByRound);

module.exports = router;
