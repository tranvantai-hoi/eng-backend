const pool = require('../config/db');

class Registration {
  // Hàm lưu OTP (Tạo mới hoặc Cập nhật)
  static async saveOtp(maSV, roundId, otp) {
    try {
      // Kiểm tra xem đã có bản ghi nào chưa (Bất kể trạng thái)
      // Sử dụng cú pháp an toàn cho tên cột
      const checkQuery = `
        SELECT * FROM registrations 
        WHERE ("MaSV" = $1 OR masv = $1) 
        AND ("RoundId" = $2 OR roundid = $2)
      `;
      const checkResult = await pool.query(checkQuery, [maSV, roundId]);

      if (checkResult.rows.length > 0) {
        // Update OTP
        const updateQuery = `
          UPDATE registrations 
          SET "OTP" = $1, "UpdatedAt" = CURRENT_TIMESTAMP 
          WHERE ("MaSV" = $2 OR masv = $2) AND ("RoundId" = $3 OR roundid = $3)
          RETURNING *
        `;
        const result = await pool.query(updateQuery, [otp, maSV, roundId]);
        return result.rows[0];
      } else {
        // Insert OTP (Tạo đơn nháp)
        // Lưu ý: Đảm bảo tên cột trong câu INSERT khớp với DB của bạn
        const insertQuery = `
          INSERT INTO registrations ("MaSV", "RoundId", "TrangThai", "OTP")
          VALUES ($1, $2, 'verifying', $3)
          RETURNING *
        `;
        const result = await pool.query(insertQuery, [maSV, roundId, otp]);
        return result.rows[0];
      }
    } catch (err) {
      console.error("Lỗi saveOtp:", err);
      throw err;
    }
  }

  // Hàm xác thực và hoàn tất
  static async verifyAndComplete(maSV, roundId, otp) {
    try {
      const updateQuery = `
        UPDATE registrations 
        SET "TrangThai" = 'pending', "OTP" = NULL, "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE ("MaSV" = $1 OR masv = $1) 
          AND ("RoundId" = $2 OR roundid = $2) 
          AND ("OTP" = $3 OR otp = $3)
        RETURNING *
      `;
      const result = await pool.query(updateQuery, [maSV, roundId, otp]);
      return result.rows[0];
    } catch (err) {
      console.error("Lỗi verifyAndComplete:", err);
      throw err;
    }
  }
  
  // ... các hàm khác ...
  static async findByStudentAndRound(maSV, roundId) {
      const query = 'SELECT * FROM registrations WHERE ("MaSV" = $1 OR masv = $1) AND ("RoundId" = $2 OR roundid = $2)';
      const result = await pool.query(query, [maSV, roundId]);
      return result.rows[0];
  }
}

module.exports = Registration;
