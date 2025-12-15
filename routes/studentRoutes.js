const express = require('express');
const router = express.Router();
const { getStudents, updateContactInfo } = require('../controllers/studentController');

router.get('/', getStudents);
router.post('/update-contact', updateContactInfo);

module.exports = router;

