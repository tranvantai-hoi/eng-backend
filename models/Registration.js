const pool = require('../config/db');

class Registration {
  static async findByStudentAndRound(maSV, roundId) {
    try {
      // Tìm kiếm linh hoạt (hoa/thường)
      const query = `
        SELECT * FROM registrations 
        WHERE ("MaSV" = $1 OR "masv" = $1) 
        AND ("RoundId" = $2 OR "roundid" = $2)
        LIMIT 1
      `;
      const result = await pool.query(query, [maSV, roundId]);
      return result.rows[0];
    } catch (err) {
      console.error("Model Error (findByStudentAndRound):", err.message);
      return null;
    }
  }

  static async saveOtp(maSV, roundId, otp) {
    const existing = await this.findByStudentAndRound(maSV, roundId);
    
    if (existing) {
      // Cập nhật OTP
      const query = `
        UPDATE registrations 
        SET "OTP" = $1, "UpdatedAt" = CURRENT_TIMESTAMP 
        WHERE ("MaSV" = $2 OR "masv" = $2) AND ("RoundId" = $3 OR "roundid" = $3)
      `;
      await pool.query(query, [otp, maSV, roundId]);
    } else {
      // Tạo mới
      const query = `
        INSERT INTO registrations ("MaSV", "RoundId", "TrangThai", "OTP") 
        VALUES ($1, $2, 'verifying', $3)
      `;
      await pool.query(query, [maSV, roundId, otp]);
    }
  }

  static async verifyAndComplete(maSV, roundId, otp) {
    // Kiểm tra OTP và chuyển trạng thái
    const query = `
      UPDATE registrations 
      SET "TrangThai" = 'pending', "OTP" = NULL, "UpdatedAt" = CURRENT_TIMESTAMP
      WHERE ("MaSV" = $1 OR "masv" = $1) 
        AND ("RoundId" = $2 OR "roundid" = $2) 
        AND ("OTP" = $3 OR "otp" = $3)
      RETURNING *
    `;
    const result = await pool.query(query, [maSV, roundId, otp]);
    return result.rows[0];
  }
}

module.exports = Registration;
