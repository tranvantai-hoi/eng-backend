const Registration = require('../models/Registration');
const ExamRound = require('../models/ExamRound');
const Student = require('../models/Student');

// --- GỬI MÃ OTP ---
exports.sendOtp = async (req, res) => {
  try {
    const { mssv, email } = req.body;
    if (!mssv || !email) {
      return res.status(400).json({ message: 'Vui lòng cung cấp MSSV và Email.' });
    }

    // 1. Tìm đợt thi đang mở (Active)
    const activeRound = await ExamRound.findActive();
    if (!activeRound) {
      return res.status(400).json({ message: 'Hiện tại không có đợt thi nào đang mở đăng ký.' });
    }

    // 2. Kiểm tra nếu đã đăng ký thành công rồi
    const existingReg = await Registration.findByStudentAndRound(mssv, activeRound.id);
    // Nếu trạng thái khác 'verifying' tức là đã đăng ký xong (pending/confirmed)
    if (existingReg && existingReg.TrangThai !== 'verifying') {
      return res.status(400).json({ message: 'Bạn đã đăng ký đợt thi này rồi.' });
    }

    // 3. Tạo OTP (6 số ngẫu nhiên)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Lưu vào DB
    await Registration.saveOtp(mssv, activeRound.id, otp);

    // 5. Giả lập gửi Email (Log ra console)
    console.log(`📧 [MOCK EMAIL] Gửi OTP: ${otp} tới ${email}`);

    res.json({ 
      status: 'success',
      message: 'Mã xác thực đã được gửi tới email.',
      debugOtp: otp // Chỉ dùng khi dev để test nhanh
    });

  } catch (error) {
    console.error("Lỗi gửi OTP:", error);
    res.status(500).json({ message: 'Lỗi server khi gửi mã OTP.' });
  }
};

// --- XÁC THỰC & ĐĂNG KÝ ---
exports.register = async (req, res) => {
  try {
    const { mssv, email, phone, otp } = req.body;
    
    if (!mssv || !otp) {
      return res.status(400).json({ message: 'Thiếu thông tin xác thực (MSSV/OTP).' });
    }

    const activeRound = await ExamRound.findActive();
    if (!activeRound) {
      return res.status(400).json({ message: 'Không tìm thấy đợt thi đang mở.' });
    }

    // 1. Cập nhật thông tin liên lạc mới nhất cho Sinh viên
    if (email || phone) {
      try {
        await Student.updateContactInfo(mssv, email, phone);
      } catch (err) {
        console.warn("Không thể cập nhật thông tin liên lạc:", err.message);
        // Không chặn luồng đăng ký nếu update thông tin thất bại
      }
    }

    // 2. Xác thực OTP và Chuyển trạng thái đơn đăng ký
    const result = await Registration.verifyAndComplete(mssv, activeRound.id, otp);

    if (!result) {
      return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
    }

    res.status(201).json({
      status: 'success',
      message: 'Đăng ký thành công!',
      data: result
    });

  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký.' });
  }
};

// --- CÁC HÀM PHỤ KHÁC ---
exports.getHistory = async (req, res) => {
    // Logic lấy lịch sử (nếu cần)
    res.json({ data: [] });
};
