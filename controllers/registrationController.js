const Registration = require('../models/Registration');
const ExamRound = require('../models/ExamRound');
const Student = require('../models/Student');

exports.sendOtp = async (req, res) => {
  try {
    const { mssv, email } = req.body;
    if (!mssv || !email) return res.status(400).json({ message: 'Thiếu MSSV hoặc Email.' });

    // 1. Tìm đợt thi active
    const activeRound = await ExamRound.findActive();
    if (!activeRound) return res.status(400).json({ message: 'Không có đợt thi nào đang mở.' });

    // 2. Kiểm tra đã đăng ký chưa
    const existing = await Registration.findByStudentAndRound(mssv, activeRound.id);
    if (existing && existing.TrangThai !== 'verifying') {
        return res.status(400).json({ message: 'Sinh viên đã đăng ký đợt thi này rồi.' });
    }

    // 3. Tạo và Lưu OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Registration.saveOtp(mssv, activeRound.id, otp);

    // 4. Gửi Email (Giả lập)
    console.log(`📧 GỬI OTP: ${otp} tới ${email}`);

    // Trả về otp để test (xóa debugOtp khi chạy thật)
    res.json({ message: 'Đã gửi mã OTP.', debugOtp: otp });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi hệ thống khi gửi OTP.' });
  }
};

exports.register = async (req, res) => {
  try {
    const { mssv, email, phone, otp } = req.body;
    if (!mssv || !otp) return res.status(400).json({ message: 'Thiếu thông tin xác thực.' });

    const activeRound = await ExamRound.findActive();
    if (!activeRound) return res.status(400).json({ message: 'Không có đợt thi đang mở.' });

    // Cập nhật thông tin SV
    if (email || phone) await Student.updateContactInfo(mssv, email, phone);

    // Xác thực OTP
    const result = await Registration.verifyAndComplete(mssv, activeRound.id, otp);
    
    if (!result) {
        return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    }

    res.status(201).json({ message: 'Đăng ký thành công!', data: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký.' });
  }
};

// Các hàm khác (getHistory...) giữ nguyên
