const Registration = require('../models/Registration');
const ExamRound = require('../models/ExamRound');
const Student = require('../models/Student');

// API 1: Gửi OTP
exports.sendOtp = async (req, res) => {
  try {
    const { mssv, email } = req.body;
    if (!mssv || !email) {
      return res.status(400).json({ message: 'Vui lòng nhập MSSV và Email.' });
    }

    // 1. Tìm đợt thi active
    const activeRound = await ExamRound.findActive();
    if (!activeRound) {
      return res.status(400).json({ message: 'Chưa có đợt thi nào được mở.' });
    }

    // 2. Kiểm tra trạng thái
    const existing = await Registration.findByStudentAndRound(mssv, activeRound.id);
    if (existing && existing.TrangThai !== 'verifying') {
      return res.status(400).json({ message: 'Bạn đã đăng ký đợt thi này rồi.' });
    }

    // 3. Tạo và lưu OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Registration.saveOtp(mssv, activeRound.id, otp);

    // 4. Log OTP ra console (Giả lập gửi mail)
    console.log(`==========================================`);
    console.log(`📧 EMAIL MÔ PHỎNG: Gửi tới ${email}`);
    console.log(`🔑 MÃ OTP: ${otp}`);
    console.log(`==========================================`);

    res.json({ 
      message: 'Mã xác thực đã được gửi (Vui lòng kiểm tra console server).',
      debugOtp: otp 
    });

  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    res.status(500).json({ message: 'Lỗi hệ thống khi gửi OTP.' });
  }
};

// API 2: Xác thực & Đăng ký
exports.register = async (req, res) => {
  try {
    const { mssv, email, phone, otp } = req.body;
    
    if (!mssv || !otp) {
      return res.status(400).json({ message: 'Thiếu mã số sinh viên hoặc OTP.' });
    }

    const activeRound = await ExamRound.findActive();
    if (!activeRound) {
      return res.status(400).json({ message: 'Không tìm thấy đợt thi.' });
    }

    // Cập nhật thông tin liên lạc
    if (email || phone) {
       await Student.updateContactInfo(mssv, email, phone);
    }

    // Xác thực OTP
    const result = await Registration.verifyAndComplete(mssv, activeRound.id, otp);

    if (!result) {
      return res.status(400).json({ message: 'Mã OTP không chính xác.' });
    }

    res.status(201).json({
      message: 'Đăng ký thành công!',
      data: result
    });

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký.' });
  }
};

exports.getHistory = async (req, res) => { res.json({data:[]}) };
