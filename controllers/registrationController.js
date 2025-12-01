const Registration = require('../models/Registration');
const ExamRound = require('../models/ExamRound');
const Student = require('../models/Student');

// Gửi OTP
exports.sendOtp = async (req, res) => {
  try {
    const { mssv, email } = req.body;
    if (!mssv || !email) return res.status(400).json({ message: 'Thiếu MSSV hoặc Email.' });

    // Tìm đợt thi active
    const activeRound = await ExamRound.findActive();
    if (!activeRound) {
        return res.status(404).json({ message: 'Hiện tại không có đợt thi nào được mở.' });
    }

    // Kiểm tra đã đăng ký thành công chưa
    const existing = await Registration.findByStudentAndRound(mssv, activeRound.id);
    if (existing && existing.TrangThai !== 'verifying') {
        return res.status(400).json({ message: 'Bạn đã đăng ký đợt thi này rồi.' });
    }

    // Tạo OTP & Lưu
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Registration.saveOtp(mssv, activeRound.id, otp);

    console.log(`📧 OTP sent to ${email}: ${otp}`);
    
    res.json({ message: 'Mã OTP đã gửi.', debugOtp: otp });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: 'Lỗi server khi gửi OTP.' });
  }
};

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { mssv, email, phone, otp } = req.body;
    if (!mssv || !otp) return res.status(400).json({ message: 'Thiếu thông tin xác thực.' });

    const activeRound = await ExamRound.findActive();
    if (!activeRound) return res.status(404).json({ message: 'Đợt thi đã đóng.' });

    // Cập nhật thông tin SV (nếu có)
    if (email || phone) {
        await Student.updateContactInfo(mssv, email, phone).catch(e => console.log('Update info warning:', e.message));
    }

    // Xác thực OTP
    const result = await Registration.verifyAndComplete(mssv, activeRound.id, otp);
    
    if (!result) {
        return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
    }

    res.status(201).json({ message: 'Đăng ký thành công!', data: result });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
  }
};

exports.getHistory = async (req, res) => { res.json({data:[]}) };
