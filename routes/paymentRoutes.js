const express = require('express');
const router = express.Router();
const {
  createPayment,
  paymentCallback
} = require('../controllers/paymentController');

router.post('/create', createPayment);
router.post('/callback', paymentCallback);

module.exports = router;

