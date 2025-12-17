const { request } = require('express');
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

const updateStudentFullInfo = async (req, res) => {
  try {
      const { mssv, fullName, dob, gender, faculty, email, phone } = req.body;
      if (!mssv) return res.status(400).json({ message: 'Thiếu mã sinh viên' });
      const updatedStudent = await Student.updateFull(mssv, { fullName, dob, gender, faculty, email, phone });
      if (!updatedStudent) return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
      return res.status(200).json({ success: true, data: updatedStudent });
  } catch (error) {
      console.error("Lỗi cập nhật:", error);
      return res.status(500).json({ message: 'Lỗi server' });
  }
};

// --- [MỚI] Hàm xử lý Import Excel ---
const importStudents = async (req, res) => {
try {
  const studentsList = req.body; // Mảng danh sách sinh viên gửi từ Frontend

  if (!Array.isArray(studentsList) || studentsList.length === 0) {
    return res.status(400).json({ message: 'Dữ liệu nhập không hợp lệ hoặc rỗng.' });
  }

  // Gọi Model thực hiện Bulk Insert
  const count = await Student.bulkCreate(studentsList);

  return res.status(200).json({ 
    success: true, 
    message: `Đã nhập thành công ${count} sinh viên.`,
    count: count
  });

} catch (error) {
  console.error("Lỗi import sinh viên:", error);
  return res.status(500).json({ message: 'Lỗi server khi nhập dữ liệu: ' + error.message });
}
};

const deleteStudents = async (req,res) =>{
  try{
    const {mssv} = req.params;
    const sinhvien = await Student.findByMaSV(mssv);
    if (!sinhvien) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên cần xóa'
      });
    }

    await Student.delete(mssv);
    res.status(200).json({
      success: true,
      message: 'Đã xóa sinh viên thành công'
    });
  } catch (error) {
    next(error);
}
};

module.exports = {
  getStudents,
  updateContactInfo,
  updateStudentFullInfo,
  importStudents,
  deleteStudents
};