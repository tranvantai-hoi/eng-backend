const Registration = require('../models/Registration');
const Student = require('../models/Student');
const ExamRound = require('../models/ExamRound');
// Import model OTP (chữ thường cho khớp file)
const Otp = require('../models/otp'); 
// Import mailer từ thư mục models như bạn yêu cầu
const mailer = require('../models/mailer'); 

// --- 1. Gửi OTP ---
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

    // Tạo mã 6 số
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu vào DB
    await Otp.create({ email, code });

    // --- GỬI EMAIL THẬT ---
    const subject = "Mã Xác Thực Đăng Ký Kiểm Tra Năng Lực";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h3 style="color: #0056b3;">Xin chào,</h3>
        <p>Bạn đang thực hiện đăng ký kiểm tra năng lực tiếng Anh.</p>
        <p>Mã xác thực (OTP) của bạn là:</p>
        <h2 style="color: #d9534f; letter-spacing: 2px;">${code}</h2>
        <p>Mã này sẽ hết hạn trong 5 phút.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <small style="color: #666;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</small>
      </div>
    `;
    
    // Gọi hàm gửi mail
    await mailer.sendEmail(email, subject, htmlContent);
    
    res.status(200).json({ success: true, message: 'Đã gửi mã OTP qua email' });
  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    next(error);
  }
}; // <--- ĐÃ SỬA: Thêm dấu đóng ngoặc bị thiếu ở bản cũ

// --- [QUAN TRỌNG] Hàm lấy đợt thi Active (Phải có để Bước 3 Frontend chạy) ---
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
  sendOtp,
  getRoundActive, // Export thêm hàm này
  createRegistration,
  getRegistrationById,
  getRegistrationsByRound
};
