const Registration = require('../models/Registration');
const Student = require('../models/Student');
const ExamRound = require('../models/ExamRound');

const createRegistration = async (req, res, next) => {
  try {
    const { MaSV, RoundId, TrangThai } = req.body;

    if (!MaSV || !RoundId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: MaSV, RoundId'
      });
    }

    // Check if student exists
    const student = await Student.findByMaSV(MaSV);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if exam round exists
    const round = await ExamRound.findById(RoundId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Exam round not found'
      });
    }

    // Check if already registered
    const existing = await Registration.checkExisting(MaSV, RoundId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Student already registered for this exam round'
      });
    }

    const registration = await Registration.create({
      MaSV,
      RoundId,
      TrangThai
    });

    res.status(201).json({
      success: true,
      data: registration
    });
  } catch (error) {
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
        message: 'Registration not found'
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

    const round = await ExamRound.findById(roundId);
    if (!round) {
      return res.status(404).json({
        success: false,
        message: 'Exam round not found'
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

