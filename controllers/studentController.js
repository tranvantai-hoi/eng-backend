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

const updateContactInfo = async (req, res) => {
  try {
      const { mssv, email, phone } = req.body;

      // Validation cơ bản
      if (!mssv) return res.status(400).json({ message: 'Thiếu mã sinh viên' });

      // --- ĐÃ SỬA: Thay studentModel thành Student ---
      const updatedStudent = await Student.updateContact(mssv, email, phone);

      if (!updatedStudent) {
          return res.status(404).json({ message: 'Không tìm thấy sinh viên để cập nhật' });
      }

      return res.status(200).json({ success: true, data: updatedStudent });
  } catch (error) {
      console.error("Lỗi cập nhật contact:", error);
      return res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getStudents,
  updateContactInfo
};