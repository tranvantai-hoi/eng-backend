const Registration = require('../models/Registration');
const ExamRound = require('../models/ExamRound');
const Student = require('../models/Student');

// --- GỬI OTP ---
exports.sendOtp = async (req, res) => {
  try {
    const { mssv, email } = req.body;
    if (!mssv || !email) return res.status(400).json({ message: 'Thiếu MSSV hoặc Email.' });

    // 1. Tìm đợt thi đang mở
    const activeRound = await ExamRound.findActive();
    if (!activeRound) return res.status(400).json({ message: 'Hiện không có đợt thi nào mở.' });

    // 2. Kiểm tra nếu đã đăng ký xong rồi
    const existing = await Registration.findByStudentAndRound(mssv, activeRound.id);
    if (existing && existing.TrangThai !== 'verifying') {
      return res.status(400).json({ message: 'Bạn đã đăng ký đợt thi này rồi.' });
    }

    // 3. Sinh OTP & Lưu DB
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Registration.saveOtp(mssv, activeRound.id, otp);

    // 4. Gửi Email (Giả lập log console)
    console.log(`📧 [MOCK EMAIL] Gửi OTP: ${otp} đến ${email}`);

    res.json({ 
      message: 'Đã gửi mã OTP. Vui lòng kiểm tra email.',
      debugOtp: otp // Dùng để test, xóa khi chạy thật
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi hệ thống khi gửi OTP.' });
  }
};

// --- XÁC NHẬN ĐĂNG KÝ ---
exports.register = async (req, res) => {
  try {
    const { mssv, email, phone, otp } = req.body;
    if (!mssv || !otp) return res.status(400).json({ message: 'Thiếu mã xác thực OTP.' });

    const activeRound = await ExamRound.findActive();
    if (!activeRound) return res.status(400).json({ message: 'Đợt thi đã đóng.' });

    // Cập nhật thông tin liên lạc cho SV
    if (email || phone) {
      await Student.updateContactInfo(mssv, email, phone).catch(console.error);
    }

    // Xác thực OTP
    const result = await Registration.verifyAndComplete(mssv, activeRound.id, otp);
    
    if (!result) {
      return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
    }

    res.status(201).json({
      message: 'Đăng ký thành công!',
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký.' });
  }
};

exports.getHistory = async (req, res) => { res.json({data:[]}) };
