const express = require('express');
const router = express.Router();
const { getStudents, updateContactInfo, updateStudentFullInfo, importStudents } = require('../controllers/studentController');

router.get('/', getStudents);
router.post('/update-contact', updateContactInfo);
router.post('/update', updateStudentFullInfo);
router.post('/import', importStudents);
module.exports = router;

