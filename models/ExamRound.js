const pool = require('../config/db');

class ExamRound {
  static async findAll() {
    // [SỬA] Đảm bảo select đủ cột, bao gồm LePhi
    const query = 'SELECT * FROM exam_rounds ORDER BY "NgayThi" DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM exam_rounds WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findActive() {
    try {
      const query = `SELECT * FROM exam_rounds WHERE "TrangThai" ILIKE 'active' ORDER BY "NgayThi" ASC`;
      const result = await pool.query(query);
      return result.rows; 
    } catch (err) {
      console.error("Lỗi tìm đợt thi active:", err);
      return []; 
    }
  }

  static async create(data) {
    // [SỬA] Thêm LePhi vào hàm create
    const { TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, LePhi, TrangThai } = data;
    const query = `
      INSERT INTO exam_rounds ("TenDot", "NgayThi", "GioThi", "DiaDiem", "SoLuongToiDa", "LePhi", "TrangThai")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    // Thêm LePhi vào mảng values (mặc định 0 nếu không có)
    const values = [TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, LePhi || 0, TrangThai || 'active'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, data) {
    // [SỬA] Thêm LePhi vào hàm update
    const { TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, LePhi, TrangThai } = data;
    const query = `
      UPDATE exam_rounds
      SET "TenDot" = COALESCE($1, "TenDot"),
          "NgayThi" = COALESCE($2, "NgayThi"),
          "GioThi" = COALESCE($3, "GioThi"),
          "DiaDiem" = COALESCE($4, "DiaDiem"),
          "SoLuongToiDa" = COALESCE($5, "SoLuongToiDa"),
          "LePhi" = COALESCE($6, "LePhi"),
          "TrangThai" = COALESCE($7, "TrangThai"),
          "UpdatedAt" = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    // Thêm LePhi vào mảng values
    const values = [TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, LePhi, TrangThai, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM exam_rounds WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = ExamRound;