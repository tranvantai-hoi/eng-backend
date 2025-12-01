const pool = require('../config/db');

class Registration {
  // Hàm hỗ trợ tìm kiếm đơn đăng ký theo MaSV và RoundId
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
      console.error("Lỗi Registration.findByStudentAndRound:", err);
      throw err;
    }
  }

  // Hàm lưu OTP: Nếu chưa có thì tạo mới, có rồi thì cập nhật
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
        // Insert mới (Trạng thái verifying)
        const insertQuery = `
          INSERT INTO registrations ("MaSV", "RoundId", "TrangThai", "OTP")
          VALUES ($1, $2, 'verifying', $3)
          RETURNING *
        `;
        const result = await pool.query(insertQuery, [maSV, roundId, otp]);
        return result.rows[0];
      }
    } catch (err) {
      console.error("Lỗi Registration.saveOtp:", err);
      throw err;
    }
  }

  // Hàm xác thực OTP và hoàn tất
  static async verifyAndComplete(maSV, roundId, otp) {
    try {
      // Cập nhật trạng thái nếu OTP khớp
      const updateQuery = `
        UPDATE registrations 
        SET "TrangThai" = 'pending', "OTP" = NULL, "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE ("MaSV" = $1 OR "masv" = $1) 
          AND ("RoundId" = $2 OR "roundid" = $2) 
          AND ("OTP" = $3 OR "otp" = $3)
        RETURNING *
      `;
      const result = await pool.query(updateQuery, [maSV, roundId, otp]);
      return result.rows[0]; // Trả về bản ghi nếu update thành công (tức là OTP đúng)
    } catch (err) {
      console.error("Lỗi Registration.verifyAndComplete:", err);
      throw err;
    }
  }
  
  // Lấy danh sách theo đợt thi (cho Admin)
  static async findByRoundId(roundId) {
    const query = `
      SELECT r.*, s."HoTen", s."Lop", s."MaSV"
      FROM registrations r
      JOIN students s ON (r."MaSV" = s."MaSV" OR r."masv" = s."MaSV")
      WHERE (r."RoundId" = $1 OR r."roundid" = $1)
      ORDER BY r."CreatedAt" DESC
    `;
    const result = await pool.query(query, [roundId]);
    return result.rows;
  }
}

module.exports = Registration;
