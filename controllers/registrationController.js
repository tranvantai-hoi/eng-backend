const Registration = require('../models/Registration');
const Student = require('../models/Student');
const ExamRound = require('../models/ExamRound');
// [SỬA] Đảm bảo tên file khớp chính xác (Thường là Otp.js hoặc otp.js)
// Nếu file model của bạn viết hoa là Otp.js, hãy sửa dòng dưới thành '../models/Otp'
const Otp = require('../models/Otp'); 
const { sendOtpEmail } = require("../services/emailService");

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