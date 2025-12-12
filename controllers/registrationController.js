const Registration = require('../models/Registration');
const Student = require('../models/Student');
const ExamRound = require('../models/ExamRound');
// SỬA LỖI: Tên file là otp.js nên phải require đúng tên (chữ thường)
const Otp = require('../models/otp');

// --- 1. Gửi OTP ---
const createOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

    // Tạo mã ngẫu nhiên 6 số
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu vào DB
    await Otp.create({ email, code });

    // Log ra console để bạn thấy mã (Thay bằng gửi email thật sau này)
    console.log(`[OTP SYSTEM] Mã xác thực gửi đến ${email}: ${code}`);
    
    res.status(200).json({ success: true, message: 'Đã gửi mã OTP thành công' });
  } catch (error) {
    console.error("Lỗi tạo OTP:", error);
    next(error);
  }
};

//kiểm tra mã otp hợp lệ
const verifyOtp = async (req, res, next) => {
  Try{
  const { email, otp } = req.body;
  const VLOtp = await Otp.findValidOtp(email, otp);
    if (!VLOtp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã OTP không chính xác hoặc đã hết hạn' 
      });
    }
  } catch (error) {
    console.error("Lỗi kiểm tra mã otp:", error);
    next(error);
  }
};

// --- 2. Đăng ký thi (Có xác thực OTP) ---
const createRegistration = async (req, res, next) => {
  try {
    const { mssv, sessionId, email, phone, otp } = req.body;

    // Validate đầu vào
    if (!mssv || !sessionId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc: MSSV, Đợt thi hoặc OTP' 
      });
    }

    // BƯỚC 1: Kiểm tra OTP
    const validOtp = await Otp.findValidOtp(email, otp);
    if (!validOtp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã OTP không chính xác hoặc đã hết hạn' 
      });
    }

    // BƯỚC 2: Kiểm tra Sinh viên
    const student = await Student.findByMaSV(mssv);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sinh viên có mã ${mssv}`
      });
    }

    // BƯỚC 3: Kiểm tra Đợt thi
    const round = await ExamRound.findById(sessionId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đợt thi này'
      });
    }

    // BƯỚC 4: Kiểm tra Trùng lặp
    const existing = await Registration.checkExisting(mssv, sessionId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Sinh viên đã đăng ký đợt thi này rồi'
      });
    }

    // BƯỚC 5: Tạo đăng ký
    const registration = await Registration.create({
      MaSV: mssv,
      RoundId: sessionId,
      TrangThai: 'pending'
    });

    // BƯỚC 6: Hủy OTP sau khi dùng xong
    if (validOtp && validOtp.id) {
        await Otp.markAsUsed(validOtp.id);
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      data: registration
    });

  } catch (error) {
    console.error("Lỗi tạo đăng ký:", error);
    next(error);
  }
};

const getRegistrationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);
    if (!registration) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    res.status(200).json({ success: true, data: registration });
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

module.exports = {
  createOtp,
  verifyOtp,
  createRegistration,
  getRegistrationById,
  getRegistrationsByRound
};
