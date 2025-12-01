const pool = require('../config/db');

class Registration {
  // Tìm đơn theo SV và Đợt thi (An toàn với tên cột hoa/thường)
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
      console.error("Lỗi DB findByStudentAndRound:", err.message);
      return null;
    }
  }

  // Lưu OTP (Nếu chưa có đơn -> Tạo mới. Nếu có rồi -> Update OTP)
  static async saveOtp(maSV, roundId, otp) {
    try {
      const existing = await this.findByStudentAndRound(maSV, roundId);

      if (existing) {
        // Update OTP
        const updateQuery = `
          UPDATE registrations 
          SET "OTP" = $1, "UpdatedAt" = CURRENT_TIMESTAMP 
          WHERE ("MaSV" = $2 OR "masv" = $2) AND ("RoundId" = $3 OR "roundid" = $3)
          RETURNING *
        `;
        const result = await pool.query(updateQuery, [otp, maSV, roundId]);
        return result.rows[0];
      } else {
        // Tạo đơn mới trạng thái 'verifying'
        const insertQuery = `
          INSERT INTO registrations ("MaSV", "RoundId", "TrangThai", "OTP")
          VALUES ($1, $2, 'verifying', $3)
          RETURNING *
        `;
        const result = await pool.query(insertQuery, [maSV, roundId, otp]);
        return result.rows[0];
      }
    } catch (err) {
      console.error("Lỗi DB saveOtp:", err.message);
      throw err;
    }
  }

  // Xác thực OTP: Nếu đúng thì chuyển trạng thái sang 'pending'
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
      console.error("Lỗi DB verifyAndComplete:", err.message);
      throw err;
    }
  }
}

module.exports = Registration;
