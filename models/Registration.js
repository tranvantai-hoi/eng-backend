const pool = require('../config/db');

class Registration {
  static async findById(id) {
    const query = 'SELECT * FROM registrations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Tìm đơn đăng ký của sinh viên trong đợt thi cụ thể
  static async findByStudentAndRound(maSV, roundId) {
    const query = 'SELECT * FROM registrations WHERE "MaSV" = $1 AND "RoundId" = $2';
    const result = await pool.query(query, [maSV, roundId]);
    return result.rows[0];
  }

  // Hàm lưu OTP: Nếu chưa có đơn thì tạo nháp, nếu có rồi thì cập nhật OTP
  static async saveOtp(maSV, roundId, otp) {
    const checkQuery = 'SELECT * FROM registrations WHERE "MaSV" = $1 AND "RoundId" = $2';
    const checkResult = await pool.query(checkQuery, [maSV, roundId]);

    if (checkResult.rows.length > 0) {
      // Nếu đã có đơn, cập nhật OTP
      const updateQuery = `
        UPDATE registrations 
        SET "OTP" = $1, "UpdatedAt" = CURRENT_TIMESTAMP 
        WHERE "MaSV" = $2 AND "RoundId" = $3
        RETURNING *
      `;
      const result = await pool.query(updateQuery, [otp, maSV, roundId]);
      return result.rows[0];
    } else {
      // Nếu chưa có, tạo đơn mới với trạng thái 'verifying' (đang xác thực)
      const insertQuery = `
        INSERT INTO registrations ("MaSV", "RoundId", "TrangThai", "OTP")
        VALUES ($1, $2, 'verifying', $3)
        RETURNING *
      `;
      const result = await pool.query(insertQuery, [maSV, roundId, otp]);
      return result.rows[0];
    }
  }

  // Hàm xác thực OTP và hoàn tất đăng ký
  static async verifyAndComplete(maSV, roundId, otp) {
    // Kiểm tra OTP có khớp không
    const checkQuery = `
      SELECT * FROM registrations 
      WHERE "MaSV" = $1 AND "RoundId" = $2 AND "OTP" = $3
    `;
    const checkResult = await pool.query(checkQuery, [maSV, roundId, otp]);

    if (checkResult.rows.length === 0) {
      return null; // OTP sai hoặc không tìm thấy đơn
    }

    // Nếu đúng OTP, cập nhật trạng thái sang 'pending' (chờ thanh toán) và xóa OTP
    const updateQuery = `
      UPDATE registrations 
      SET "TrangThai" = 'pending', "OTP" = NULL, "UpdatedAt" = CURRENT_TIMESTAMP
      WHERE "MaSV" = $1 AND "RoundId" = $2
      RETURNING *
    `;
    const result = await pool.query(updateQuery, [maSV, roundId]);
    return result.rows[0];
  }

  static async findByRoundId(roundId) {
    const query = `
      SELECT r.*, s."HoTen", s."Lop", s."MaSV", er."TenDot", er."NgayThi", er."GioThi"
      FROM registrations r
      JOIN students s ON r."MaSV" = s."MaSV"
      JOIN exam_rounds er ON r."RoundId" = er.id
      WHERE r."RoundId" = $1
      ORDER BY r."CreatedAt" DESC
    `;
    const result = await pool.query(query, [roundId]);
    return result.rows;
  }
}

module.exports = Registration;
