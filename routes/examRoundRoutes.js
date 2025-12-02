const express = require('express');
const router = express.Router();
const {
  getRounds,
  getRounds,
  createRound,
  updateRound,
  deleteRound
} = require('../controllers/examRoundController');
router.get('/', getRoundActive);
router.get('/', getRounds);
router.post('/', createRound);
router.put('/:id', updateRound);
router.delete('/:id', deleteRound);

module.exports = router;

