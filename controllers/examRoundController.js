const ExamRound = require('../models/ExamRound');

const getRoundActive = async (req, res, next) => {
  try {
    // Gọi hàm tìm kiếm từ Model
    const activeRound = await ExamRound.findActive();

    // Kiểm tra nếu không tìm thấy đợt nào
    if (!activeRound) {
      return res.status(404).json({
        success: false,
        message: 'Hiện tại không có đợt kiểm tra nào đang mở.'
      });
    }

    // Trả về kết quả (Lưu ý: activeRound là Object, không phải Array)
    res.status(200).json({
      success: true,
      data: activeRound
    });

  } catch (error) {
    console.error("Lỗi Controller getRoundActive:", error);
    next(error);
  }
};

const getRounds = async (req, res, next) => {
  try {
    const rounds = await ExamRound.findAll();
    res.status(200).json({
      success: true,
      data: rounds,
      count: rounds.length
    });
  } catch (error) {
    next(error);
  }
};


const createRound = async (req, res, next) => {
  try {
    const { TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, TrangThai,LePhi } = req.body;

    if (!TenDot || !NgayThi || !GioThi || !DiaDiem || !SoLuongToiDa || !LePhi) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: Đợt, Ngày thi, Giờ thi, Địa điểm, SL Tối đa, Lệ phí'
      });
    }

    const round = await ExamRound.create({
      TenDot,
      NgayThi,
      GioThi,
      DiaDiem,
      SoLuongToiDa,
      LePhi,
      TrangThai
    });

    res.status(201).json({
      success: true,
      data: round
    });
  } catch (error) {
    next(error);
  }
};

const updateRound = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const round = await ExamRound.findById(id);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Exam round not found'
      });
    }

    const updatedRound = await ExamRound.update(id, updateData);
    res.status(200).json({
      success: true,
      data: updatedRound
    });
  } catch (error) {
    next(error);
  }
};

const deleteRound = async (req, res, next) => {
  try {
    const { id } = req.params;

    const round = await ExamRound.findById(id);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Exam round not found'
      });
    }

    await ExamRound.delete(id);
    res.status(200).json({
      success: true,
      message: 'Exam round deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoundActive,
  getRounds,
  createRound,
  updateRound,
  deleteRound
};

