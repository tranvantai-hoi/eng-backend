const Registration = require('../models/Registration');
const Student = require('../models/Student');
const ExamRound = require('../models/ExamRound');
const Otp = require('../models/Otp'); // <--- Import Model mới
// const mailer = require('../utils/mailer'); // Giả sử bạn có module gửi mail

// --- HÀM MỚI: Gửi OTP ---
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng cung cấp email' });

    // 1. Tạo mã ngẫu nhiên 6 số
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Lưu vào DB
    await Otp.create({ email, code });

    // 3. Gửi email (Ở đây mình log ra console để test trước)
    console.log(`[OTP] Mã xác thực gửi đến ${email}: ${code}`);
    // await mailer.send(email, "Mã xác thực đăng ký thi", `Mã của bạn là: ${code}`);

    res.status(200).json({ success: true, message: 'Đã gửi mã OTP' });
  } catch (error) {
    next(error);
  }
};

const createRegistration = async (req, res, next) => {
  try {
    const { mssv, sessionId, email, phone, otp } = req.body; // Thêm otp - Bắt đầu phần mới thêm

    // Validate cơ bản
    if (!mssv || !sessionId || !otp) {
      return res.status(400).json({ message: 'Thiếu thông tin (MSSV, Đợt thi hoặc OTP)' });
    }

    // 1. XÁC THỰC OTP QUAN TRỌNG
    const validOtp = await Otp.findValidOtp(email, otp);
    if (!validOtp) {
      return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn' });
    }

    // 1.2. Tạo đăng ký
    const registration = await Registration.create({
      MaSV: mssv,
      RoundId: sessionId,
      TrangThai: 'pending'
    });

    // 1.3. Đánh dấu OTP đã dùng (để không dùng lại được)
    await Otp.markAsUsed(validOtp.id);
    res.status(201).json({ success: true, data: registration }); //Hết phần mới thêm

    // Map sang tên biến mà Model/Database yêu cầu
    const MaSV = mssv;
    const RoundId = sessionId;

    // 3. Kiểm tra sinh viên có tồn tại không
    const student = await Student.findByMaSV(MaSV);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sinh viên có mã ${MaSV}`
      });
    }

    // (Tùy chọn) Tại đây bạn có thể cập nhật Email/Phone cho sinh viên nếu cần
    // Nhưng để an toàn theo yêu cầu "chỉ sửa 3 file", ta bỏ qua bước update student

    // 4. Kiểm tra đợt thi có tồn tại không
    const round = await ExamRound.findById(RoundId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đợt thi này'
      });
    }

    // 5. Kiểm tra xem sinh viên đã đăng ký đợt này chưa
    const existing = await Registration.checkExisting(MaSV, RoundId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Sinh viên đã đăng ký đợt thi này rồi'
      });
    }

    // 6. Tạo đăng ký mới
    const registration = await Registration.create({
      MaSV,
      RoundId,
      TrangThai: 'pending' // Mặc định là chờ duyệt/xử lý
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      data: registration
    });

  } catch (error) {
    console.error("Lỗi tạo đăng ký:", error); // Log lỗi ra console server để dễ debug
    next(error);
  }
};

const getRegistrationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const registration = await Registration.findById(id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bản ghi đăng ký'
      });
    }

    res.status(200).json({
      success: true,
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

const getRegistrationsByRound = async (req, res, next) => {
  try {
    const { roundId } = req.params;

    // Kiểm tra round tồn tại
    const round = await ExamRound.findById(roundId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đợt thi'
      });
    }

    const registrations = await Registration.findByRoundId(roundId);
    res.status(200).json({
      success: true,
      data: registrations,
      count: registrations.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOtp, // Export thêm hàm này
  createRegistration,
  getRegistrationById,
  getRegistrationsByRound
};
