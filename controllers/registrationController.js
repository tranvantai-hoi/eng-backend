const Registration = require('../models/Registration');
const ExamRound = require('../models/ExamRound');
const Student = require('../models/Student');

exports.sendOtp = async (req, res) => {
  try {
    const { mssv, email } = req.body;
    if (!mssv || !email) return res.status(400).json({ message: 'Thiếu thông tin.' });

    const activeRound = await ExamRound.findActive();
    if (!activeRound) return res.status(400).json({ message: 'Không có đợt thi mở.' });

    // Tạo OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Registration.saveOtp(mssv, activeRound.id, otp);

    console.log(`>>> OTP for ${email}: ${otp}`); // Check terminal for OTP
    res.json({ message: 'Đã gửi OTP.', debugOtp: otp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

exports.register = async (req, res) => {
  try {
    const { mssv, email, phone, otp } = req.body;
    const activeRound = await ExamRound.findActive();
    
    if (!activeRound) return res.status(400).json({ message: 'Đợt thi đã đóng.' });

    // Update contact
    if (email || phone) await Student.updateContactInfo(mssv, email, phone);

    // Verify
    const result = await Registration.verifyAndComplete(mssv, activeRound.id, otp);
    if (!result) return res.status(400).json({ message: 'OTP sai hoặc hết hạn.' });

    res.json({ message: 'Đăng ký thành công!', data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi đăng ký.' });
  }
};
exports.getHistory = async (req, res) => { res.json({data:[]}) };
