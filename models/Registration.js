const pool = require('../config/db');

class Registration {
  static async findByStudentAndRound(maSV, roundId) {
    try {
      // Query an toàn: Thử cột hoa trước
      const query = 'SELECT * FROM registrations WHERE "MaSV" = $1 AND "RoundId" = $2';
      const result = await pool.query(query, [maSV, roundId]);
      return result.rows[0];
    } catch (err) {
       // Fallback cột thường
       if (err.code === '42703') {
          const res = await pool.query('SELECT * FROM registrations WHERE masv = $1 AND roundid = $2', [maSV, roundId]);
          return res.rows[0];
       }
       return null;
    }
  }

  static async saveOtp(maSV, roundId, otp) {
    const existing = await this.findByStudentAndRound(maSV, roundId);
    if (existing) {
      // Update 
      const query = 'UPDATE registrations SET "otp" = $1, "UpdatedAt" = NOW() WHERE "MaSV" = $2 AND "RoundId" = $3';
      await pool.query(query, [otp, maSV, roundId]);
    } else {
      // Insert
      const query = 'INSERT INTO registrations ("MaSV", "RoundId", "TrangThai", "otp") VALUES ($1, $2, $3, $4)';
      await pool.query(query, [maSV, roundId, 'verifying', otp]);
    }
  }

  static async verifyAndComplete(maSV, roundId, otp) {
    const query = `
      UPDATE registrations 
      SET "TrangThai" = 'pending', "otp" = NULL 
      WHERE "MaSV" = $1 AND "RoundId" = $2 AND "otp" = $3 
      RETURNING *
    `;
    const result = await pool.query(query, [maSV, roundId, otp]);
    return result.rows[0];
  }
}
module.exports = Registration;
