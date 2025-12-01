const Registration = require('../models/Registration');
const ExamRound = require('../models/ExamRound');
const Student = require('../models/Student');

// --- GỬI OTP ---
exports.sendOtp = async (req, res) => {
  try {
    const { mssv, email } = req.body;

    if (!mssv || !email) {
      return res.status(400).json({ message: 'Thiếu thông tin MSSV hoặc Email.' });
    }

    // 1. Tìm đợt thi đang mở
    const activeRound = await ExamRound.findActive();
    if (!activeRound) {
      return res.status(400).json({ message: 'Hiện tại không có đợt thi nào đang mở.' });
    }

    // 2. Kiểm tra nếu sinh viên đã đăng ký THÀNH CÔNG rồi (không phải đang verifying)
    const existingReg = await Registration.findByStudentAndRound(mssv, activeRound.id);
    if (existingReg && existingReg.TrangThai !== 'verifying') {
      return res.status(400).json({ message: 'Bạn đã đăng ký đợt thi này rồi. Vui lòng kiểm tra lại.' });
    }

    // 3. Tạo OTP ngẫu nhiên (6 số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Lưu OTP vào DB (Nếu chưa có record thì tạo, có rồi thì update)
    await Registration.saveOtp(mssv, activeRound.id, otp);

    // 5. Gửi Email (MÔ PHỎNG)
    // Trong thực tế, bạn sẽ dùng thư viện 'nodemailer' ở đây.
    // Ví dụ: await sendEmail(email, "Mã xác thực đăng ký thi", `Mã OTP của bạn là: ${otp}`);
    
    console.log(`📧 [MOCK EMAIL] Gửi đến ${email} - Mã OTP: ${otp}`);

    res.json({ 
      message: 'Mã xác thực đã được gửi đến email của bạn.',
      // Dev only: Trả về OTP để test dễ dàng, xóa dòng dưới khi lên production
      debugOtp: otp 
    });

  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    res.status(500).json({ message: 'Lỗi server khi gửi mã xác thực.', error: error.message });
  }
};

// --- ĐĂNG KÝ (XÁC THỰC OTP) ---
exports.register = async (req, res) => {
  try {
    const { mssv, email, phone, otp } = req.body;

    if (!mssv || !otp) {
      return res.status(400).json({ message: 'Thiếu mã số sinh viên hoặc mã OTP.' });
    }

    // 1. Tìm đợt thi đang mở
    const activeRound = await ExamRound.findActive();
    if (!activeRound) {
      return res.status(400).json({ message: 'Không tìm thấy đợt thi đang mở.' });
    }

    // 2. Cập nhật thông tin liên lạc mới nhất (Email/SĐT) cho sinh viên
    if (email || phone) {
        await Student.updateContactInfo(mssv, email, phone);
    }

    // 3. Xác thực OTP và Hoàn tất đăng ký
    const completedRegistration = await Registration.verifyAndComplete(mssv, activeRound.id, otp);

    if (!completedRegistration) {
      return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
    }

    res.status(201).json({
      message: 'Đăng ký thành công!',
      data: completedRegistration,
      round: activeRound
    });

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: 'Lỗi server khi xử lý đăng ký.', error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  // ... (Giữ nguyên logic cũ nếu có)
  res.json({ message: "Chức năng lịch sử chưa được cài đặt đầy đủ" });
};
