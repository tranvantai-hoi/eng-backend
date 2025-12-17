const pool = require('../config/db');

class Registration {
  // Tìm đăng ký cụ thể theo MaSV và RoundId (Khóa chính tổ hợp)
  static async findById(MaSV, roundId) {
    // Join với bảng students và exam_rounds để lấy đầy đủ thông tin hiển thị
    const query = `
      SELECT r.*, 
             s."HoTen", s."NgaySinh", s."GioiTinh", s."Lop", s."email", s."dienthoai",
             er."TenDot", er."NgayThi", er."GioThi", er."DiaDiem", er."lephi"
      FROM registrations r
      JOIN students s ON r."MaSV" = s."MaSV"
      JOIN exam_rounds er ON r."RoundId" = er.id
      WHERE r."MaSV" = $1 AND r."RoundId" = $2
    `;
    const result = await pool.query(query, [MaSV, roundId]);
    return result.rows[0];
  }

  // Lấy danh sách đăng ký theo Đợt thi (Dùng cho Admin)
  static async findByRoundId(roundId) {
    const query = `
      SELECT r.*, 
             s."HoTen", s."NgaySinh", s."GioiTinh", s."Lop", s."MaSV", 
             er."TenDot"
      FROM registrations r
      JOIN students s ON r."MaSV" = s."MaSV"
      JOIN exam_rounds er ON r."RoundId" = er.id
      WHERE r."RoundId" = $1
      ORDER BY r."CreatedAt" DESC
    `;
    const result = await pool.query(query, [roundId]);
    return result.rows;
  }

  static async create(data) {
    const { MaSV, RoundId, TrangThai } = data;
    
    const query = `
      INSERT INTO registrations ("MaSV", "RoundId", "TrangThai", "CreatedAt")
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    // Đảm bảo trạng thái mặc định là 'pending'
    const values = [MaSV, RoundId, TrangThai || 'pending'];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async checkExisting(MaSV, RoundId) {
    const query = 'SELECT * FROM registrations WHERE "MaSV" = $1 AND "RoundId" = $2';
    const result = await pool.query(query, [MaSV, RoundId]);
    return result.rows[0];
  }

  static async delete(MaSV, RoundId) {
    const query = 'DELETE FROM registrations WHERE "MaSV" = $1 AND "RoundId" = $2 RETURNING *';
    const result = await pool.query(query, [MaSV, RoundId]);
    return result.rows[0];
  }
}

module.exports = Registration;