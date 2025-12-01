const pool = require('../config/db');

class Registration {
  // Tìm đơn đăng ký theo Sinh viên và Đợt thi (Hỗ trợ case-insensitive)
  static async findByStudentAndRound(maSV, roundId) {
    try {
      const query = `
        SELECT * FROM registrations 
        WHERE ("MaSV" = $1 OR "masv" = $1) 
        AND ("RoundId" = $2 OR "roundid" = $2)
        LIMIT 1
      `;
      const result = await pool.query(query, [maSV, roundId]);
      return result.rows[0];
    } catch (err) {
      console.error("Lỗi Registration.findByStudentAndRound:", err.message);
      return null;
    }
  }

  // Lưu OTP (Tạo mới hoặc Cập nhật)
  static async saveOtp(maSV, roundId, otp) {
    try {
      const existing = await this.findByStudentAndRound(maSV, roundId);

      if (existing) {
        // Cập nhật OTP cho đơn đã tồn tại
        const updateQuery = `
          UPDATE registrations 
          SET "OTP" = $1, "UpdatedAt" = CURRENT_TIMESTAMP 
          WHERE ("MaSV" = $2 OR "masv" = $2) AND ("RoundId" = $3 OR "roundid" = $3)
          RETURNING *
        `;
        const result = await pool.query(updateQuery, [otp, maSV, roundId]);
        return result.rows[0];
      } else {
        // Tạo đơn mới với trạng thái verifying
        const insertQuery = `
          INSERT INTO registrations ("MaSV", "RoundId", "TrangThai", "OTP")
          VALUES ($1, $2, 'verifying', $3)
          RETURNING *
        `;
        const result = await pool.query(insertQuery, [maSV, roundId, otp]);
        return result.rows[0];
      }
    } catch (err) {
      console.error("Lỗi Registration.saveOtp:", err.message);
      throw err;
    }
  }

  // Xác thực OTP và hoàn tất
  static async verifyAndComplete(maSV, roundId, otp) {
    try {
      const updateQuery = `
        UPDATE registrations 
        SET "TrangThai" = 'pending', "OTP" = NULL, "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE ("MaSV" = $1 OR "masv" = $1) 
          AND ("RoundId" = $2 OR "roundid" = $2) 
          AND ("OTP" = $3 OR "otp" = $3)
        RETURNING *
      `;
      const result = await pool.query(updateQuery, [maSV, roundId, otp]);
      return result.rows[0];
    } catch (err) {
      console.error("Lỗi Registration.verifyAndComplete:", err.message);
      throw err;
    }
  }
  
  static async findByRoundId(roundId) {
    // ... giữ nguyên hàm này từ code cũ nếu có ...
    return [];
  }
}

module.exports = Registration;
