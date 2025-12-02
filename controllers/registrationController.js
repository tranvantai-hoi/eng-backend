const Registration = require('../models/Registration');
const Student = require('../models/Student');
const ExamRound = require('../models/ExamRound');

const createRegistration = async (req, res, next) => {
  try {
    // 1. Nhận dữ liệu từ Frontend (Lưu ý: Frontend gửi mssv và sessionId)
    const { mssv, sessionId, email, phone } = req.body;

    // 2. Validate dữ liệu đầu vào
    if (!mssv || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: MSSV hoặc Đợt thi (sessionId)'
      });
    }

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
  createRegistration,
  getRegistrationById,
  getRegistrationsByRound
};
