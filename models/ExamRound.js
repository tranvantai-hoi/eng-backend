const pool = require('../config/db');

class ExamRound {
  static async findAll() {
    const query = 'SELECT * FROM exam_rounds ORDER BY "NgayThi" DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM exam_rounds WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // --- MỚI: Tìm đợt thi đang mở ---
  static async findActive() {
    try {
      // Tìm đợt thi có trạng thái 'active' (hoặc logic tương tự)
      const query = `SELECT * FROM exam_rounds WHERE "TrangThai" = 'active' LIMIT 1`;
      const result = await pool.query(query);
      return result.rows[0];
    } catch (err) {
      console.error("Lỗi tìm đợt thi active:", err);
      return null;
    }
  }

  static async create(data) {
    const { TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, TrangThai } = data;
    const query = `
      INSERT INTO exam_rounds ("TenDot", "NgayThi", "GioThi", "DiaDiem", "SoLuongToiDa", "TrangThai")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, TrangThai || 'active'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, data) {
    const { TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, TrangThai } = data;
    const query = `
      UPDATE exam_rounds
      SET "TenDot" = COALESCE($1, "TenDot"),
          "NgayThi" = COALESCE($2, "NgayThi"),
          "GioThi" = COALESCE($3, "GioThi"),
          "DiaDiem" = COALESCE($4, "DiaDiem"),
          "SoLuongToiDa" = COALESCE($5, "SoLuongToiDa"),
          "TrangThai" = COALESCE($6, "TrangThai")
      WHERE id = $7
      RETURNING *
    `;
    const values = [TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, TrangThai, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = ExamRound;
