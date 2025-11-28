const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getRegistrationById,
  getRegistrationsByRound
} = require('../controllers/registrationController');

router.post('/', createRegistration);
router.get('/:id', getRegistrationById);
router.get('/by-round/:roundId', getRegistrationsByRound);

module.exports = router;

