const Registration = require('../models/Registration');
const Student = require('../models/Student');
const ExamRound = require('../models/ExamRound');
// Import model OTP
const Otp = require('../models/otp'); 
// Import mailer
const mailer = require('../models/mailer'); 

// --- 1. Gửi OTP ---
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

    // Tạo mã 6 số
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu vào DB
    await otp.create({ email, code });

    // Gửi email thật
    const subject = "Mã Xác Thực Đăng Ký";
    const htmlContent = `
      <div style="padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h3>Mã xác thực của bạn</h3>
        <h1 style="color: blue; letter-spacing: 3px;">${code}</h1>
        <p>Mã này có hiệu lực trong 5 phút.</p>
      </div>
    `;
    
    await mailer.sendEmail(email, subject, htmlContent);
    
    res.status(200).json({ success: true, message: 'Đã gửi mã OTP qua email' });
  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    next(error);
  }
}; // <--- ĐÃ SỬA: Thêm dấu đóng ngoặc này để hết lỗi Syntax Error

// --- [QUAN TRỌNG] Hàm lấy đợt thi Active (Bổ sung hàm này để route không bị lỗi) ---
const getRoundActive = async (req, res, next) => {
  try {
    const activeRound = await ExamRound.findActive();
    if (!activeRound) {
      return res.status(200).json({ success: true, data: null });
    }
    res.status(200).json({ success: true, data: activeRound });
  } catch (error) {
    console.error("Lỗi lấy đợt thi active:", error);
    next(error);
  }
};

// --- 2. Đăng ký thi ---
const createRegistration = async (req, res, next) => {
  try {
    const { mssv, sessionId, email, phone, otp } = req.body;

    // Validate
    if (!mssv || !sessionId || !otp) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }

    // B1: Check OTP
    const validOtp = await Otp.findValidOtp(email, otp);
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Mã OTP sai hoặc hết hạn' });
    }

    // B2: Check Sinh viên
    const student = await Student.findByMaSV(mssv);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên' });
    }

    // B3: Check Đợt thi
    const round = await ExamRound.findById(sessionId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đợt thi' });
    }

    // B4: Check Trùng
    const existing = await Registration.checkExisting(mssv, sessionId);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Sinh viên đã đăng ký rồi' });
    }

    // B5: Tạo đăng ký
    const registration = await Registration.create({
      MaSV: mssv,
      RoundId: sessionId,
      TrangThai: 'pending'
    });

    // B6: Hủy OTP
    await Otp.markAsUsed(validOtp.id);

    res.status(201).json({ success: true, message: 'Đăng ký thành công!', data: registration });

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
  sendOtp,
  getRoundActive, // Đừng quên export hàm này
  createRegistration,
  getRegistrationById,
  getRegistrationsByRound
};
