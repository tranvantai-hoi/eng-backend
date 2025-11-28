const Student = require('../models/Student');

const getStudents = async (req, res, next) => {
  try {
    const { masv } = req.query;

    if (masv) {
      const student = await Student.findByMaSV(masv);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
      return res.status(200).json({
        success: true,
        data: student
      });
    }

    const students = await Student.findAll();
    res.status(200).json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents
};

