const express = require('express');
const router = express.Router();
const { getStudents, updateContactInfo, importStudents } = require('../controllers/studentController');

router.get('/', getStudents);
router.post('/update-contact', updateContactInfo);
router.post('/import', importStudents);
module.exports = router;

