const express = require('express');
const router = express.Router();
const { getStudents, updateContactInfo, updateStudentFullInfo, importStudents, deleteStudents } = require('../controllers/studentController');

router.get('/', getStudents);
router.post('/update-contact', updateContactInfo);
router.post('/update', updateStudentFullInfo);
router.post('/import', importStudents);
router.delete('/delete', deleteStudents);
module.exports = router;

