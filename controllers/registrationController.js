const Registration = require('../models/Registration');
const Student = require('../models/Student');
const ExamRound = require('../models/ExamRound');
const Otp = require('../models/Otp');

// --- 1. Gửi OTP ---
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

    // Tạo mã ngẫu nhiên 6 số
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu vào DB
    await Otp.create({ email, code });

    // Gửi email (Mockup: Log ra console server để test)
    console.log(`[OTP SYSTEM] Mã xác thực gửi đến ${email}: ${code}`);
    
    res.status(200).json({ success: true, message: 'Đã gửi mã OTP thành công' });
  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    next(error);
  }
};

// --- 2. Đăng ký thi (Có xác thực OTP) ---
const createRegistration = async (req, res, next) => {
  try {
    const { mssv, sessionId, email, phone, otp } = req.body;

    // --- BƯỚC 1: Validate đầu vào ---
    if (!mssv || !sessionId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc: MSSV, Đợt thi hoặc OTP' 
      });
    }

    // --- BƯỚC 2: Kiểm tra OTP (Quan trọng nhất - Check trước) ---
    const validOtp = await Otp.findValidOtp(email, otp);
    if (!validOtp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã OTP không chính xác hoặc đã hết hạn' 
      });
    }

    // --- BƯỚC 3: Kiểm tra Sinh viên có tồn tại không ---
    const student = await Student.findByMaSV(mssv);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sinh viên có mã ${mssv}`
      });
    }

    // --- BƯỚC 4: Kiểm tra Đợt thi có tồn tại không ---
    const round = await ExamRound.findById(sessionId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đợt thi này'
      });
    }

    // --- BƯỚC 5: Kiểm tra đã đăng ký chưa (Tránh trùng lặp) ---
    const existing = await Registration.checkExisting(mssv, sessionId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Sinh viên đã đăng ký đợt thi này rồi'
      });
    }

    // --- BƯỚC 6: Tạo đăng ký mới (Khi mọi thứ đã OK) ---
    const registration = await Registration.create({
      MaSV: mssv,
      RoundId: sessionId,
      TrangThai: 'pending'
    });

    // --- BƯỚC 7: Hủy mã OTP (Để không dùng lại được) ---
    await Otp.markAsUsed(validOtp.id);

    // Trả về kết quả thành công
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

// --- Các hàm Get (Giữ nguyên) ---
const getRegistrationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);
    
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi' });
    }
    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
};

const getRegistrationsByRound = async (req, res, next) => {
  try {
    const { roundId } = req.params;
    const round = await ExamRound.findById(roundId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Đợt thi không tồn tại' });
    }
    const registrations = await Registration.findByRoundId(roundId);
    res.status(200).json({ success: true, data: registrations, count: registrations.length });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOtp,
  createRegistration,
  getRegistrationById,
  getRegistrationsByRound
};
