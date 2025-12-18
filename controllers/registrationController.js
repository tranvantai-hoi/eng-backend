const Registration = require('../models/Registration');
const Student = require('../models/Student');
const ExamRound = require('../models/ExamRound');
// [SỬA] Đảm bảo tên file khớp chính xác (Thường là Otp.js hoặc otp.js)
// Nếu file model của bạn viết hoa là Otp.js, hãy sửa dòng dưới thành '../models/Otp'
const Otp = require('../models/otp'); 
const { sendOtpEmail } = require("../services/emailService");
const xlsx = require('xlsx');

// --- 1. Gửi OTP ---
const createOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Tạo hoặc update OTP
    await Otp.create({ email, code });

    // Gửi email
    await sendOtpEmail(email, code);
    
    console.log(`[OTP] Gửi đến ${email}: ${code}`);
    res.status(200).json({ success: true, message: 'Đã gửi mã OTP thành công' });
  } catch (error) {
    console.error("Lỗi tạo OTP:", error);
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.query; // Lấy từ query parameters

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Thiếu email hoặc otp" });
    }
    
    const validOtp = await Otp.findValidOtp(email, otp);

    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn' });
    }

    return res.status(200).json({ success: true, message: 'Xác thực OTP thành công' });
  } catch (error) {
    console.error("Lỗi verify OTP:", error);
    next(error);
  }
};

// --- 2. Đăng ký thi ---
const createRegistration = async (req, res, next) => {
  try {
    const { mssv, sessionId, email, phone, otp } = req.body;

    // Validate cơ bản
    if (!mssv || !sessionId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc: MSSV, Đợt thi hoặc OTP' 
      });
    }

    // B1: Xác thực OTP lần cuối để đảm bảo an toàn
    const validOtp = await Otp.findValidOtp(email, otp);
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ' });
    }

    // B2: Kiểm tra sinh viên
    const student = await Student.findByMaSV(mssv);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên' });
    }

    // B3: Kiểm tra đợt thi
    const round = await ExamRound.findById(sessionId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Đợt thi không tồn tại' });
    }

    // B4: Kiểm tra đã đăng ký chưa
    const existing = await Registration.checkExisting(mssv, sessionId);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Sinh viên đã đăng ký đợt thi này rồi' });
    }

    // B5: Tạo đăng ký
    const newReg = await Registration.create({
      MaSV: mssv,
      RoundId: sessionId,
      TrangThai: 'pending' // Trạng thái chờ thanh toán
    });

    // B6: Hủy OTP
    if (validOtp.id) await Otp.markAsUsed(validOtp.id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: newReg
    });

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    next(error);
  }
};

// [QUAN TRỌNG] Đã sửa: Lấy tham số từ req.query thay vì req.body
const getRegistrationById = async (req, res, next) => {
  try {
    const { mssv, roundId } = req.query; // GET request dùng query
    
    if (!mssv || !roundId) {
        return res.status(400).json({ success: false, message: 'Thiếu mssv hoặc roundId' });
    }

    const registration = await Registration.findById(mssv, roundId);
    
    if (!registration) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ đăng ký' });
    }
    
    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    console.error("Lỗi getRegistrationById:", error);
    next(error);
  }
};


// Cập nhật trạng thái (Duyệt/Đóng phí)
const updateStatus = async (req, res, next) => {
  try {
      const { mssv, roundId, status } = req.body;
      if (!mssv || !roundId || !status) return res.status(400).json({ message: "Thiếu thông tin" });
      
      const updated = await Registration.updateStatus(mssv, roundId, status);
      res.status(200).json({ success: true, data: updated, message: "Cập nhật thành công" });
  } catch (error) {
      next(error);
  }
};

// Cập nhật chuyển đợt
const changeRound = async (req, res, next) => {
  try {
      const { mssv, originalRoundId, roundId } = req.body;
      if (!mssv || !roundId || !originalRoundId) return res.status(400).json({ message: "Thiếu thông tin" });
      
      const updated = await Registration.changeRound(mssv, originalRoundId, roundId);
      res.status(200).json({ success: true, data: updated, message: "Cập nhật thành công" });
  } catch (error) {
      next(error);
  }
};

// Xóa đăng ký
const deleteRegistration = async (req, res, next) => {
  try {
      const { mssv, roundId } = req.query; // Nhận từ query string
      if (!mssv || !roundId) return res.status(400).json({ message: "Thiếu mssv hoặc roundId" });

      await Registration.delete(mssv, roundId);
      res.status(200).json({ success: true, message: "Xóa đăng ký thành công" });
  } catch (error) {
      next(error);
  }
};

const getRegistrationsByRound = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const registrations = await Registration.findByRoundId(roundId);
    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    next(error);
  } 
};

const importScores = async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ message: 'Vui lòng tải lên một file Excel.' });
      }

      const { roundId } = req.body;
      if (!roundId) {
          return res.status(400).json({ message: 'Vui lòng chọn đợt thi để cập nhật điểm.' });
      }

      // Đọc dữ liệu từ Buffer
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (sheetData.length === 0) {
          return res.status(400).json({ message: 'File Excel không có dữ liệu.' });
      }

      // Chuyển đổi dữ liệu
      const scoreList = sheetData.map(row => ({
          mssv: String(row['Mã SV'] || row['MaSV'] || row['MSSV'] || '').trim(),
          roundId: roundId,
          nghe: parseFloat(row['Nghe'] || row['Listening']) || 0,
          noi: parseFloat(row['Noi'] || row['Speaking']) || 0,
          doc: parseFloat(row['Doc'] || row['Reading']) || 0,
          viet: parseFloat(row['Viet'] || row['Writing']) || 0,
          ketqua: String(row['KetQua'] || row['Result'] || '').trim()
      })).filter(item => item.mssv !== ''); // Loại bỏ dòng trống

      const updatedCount = await Registration.bulkUpdateScores(scoreList);

      res.status(200).json({
          success: true,
          message: `Cập nhật thành công điểm cho ${updatedCount} sinh viên.`,
          updatedCount
      });
  } catch (error) {
      console.error('Lỗi Import điểm chi tiết:', error); // Log này sẽ hiện ở console backend để bạn debug
      res.status(500).json({ message: 'Lỗi hệ thống khi xử lý file Excel: ' + error.message });
  }
};

module.exports = {
  createOtp,
  verifyOtp,
  createRegistration,
  getRegistrationById,
  getRegistrationsByRound,
  updateStatus,
  changeRound,
  deleteRegistration,
  importScores
};