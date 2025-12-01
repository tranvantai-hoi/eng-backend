const Registration = require('../models/Registration');
const ExamRound = require('../models/ExamRound');
const Student = require('../models/Student');

exports.sendOtp = async (req, res) => {
  try {
    const { mssv, email } = req.body;
    if (!mssv || !email) return res.status(400).json({ message: 'Thiếu thông tin.' });

    const activeRound = await ExamRound.findActive();
    if (!activeRound) return res.status(400).json({ message: 'Chưa có đợt thi nào mở.' });

    // Tạo OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Registration.saveOtp(mssv, activeRound.id, otp);

    console.log(`>>> OTP cho ${email}: ${otp}`); // Xem console server để lấy mã
    res.json({ message: 'OTP đã gửi (check console)', debugOtp: otp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.register = async (req, res) => {
  try {
    const { mssv, email, phone, otp } = req.body;
    const activeRound = await ExamRound.findActive();
    if (!activeRound) return res.status(400).json({ message: 'Đợt thi đã đóng.' });

    // Cập nhật thông tin SV
    if (email || phone) await Student.updateContactInfo(mssv, email, phone);

    // Verify
    const result = await Registration.verifyAndComplete(mssv, activeRound.id, otp);
    if (!result) return res.status(400).json({ message: 'OTP sai.' });

    res.status(201).json({ message: 'Thành công!', data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi đăng ký' });
  }
};

exports.getHistory = async (req, res) => { res.json({data:[]}) };
