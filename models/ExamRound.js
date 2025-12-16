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

  // --- [MỚI] Hàm tìm đợt thi đang Active ---
  static async findActive() {
    try {
      // Sửa 1: Bỏ LIMIT 1, thêm ORDER BY để sắp xếp đợt thi nào đến trước thì hiện trước
      const query = `SELECT * FROM exam_rounds WHERE "TrangThai" ILIKE 'active' ORDER BY "NgayThi" ASC`;
      
      const result = await pool.query(query);
      
      // Sửa 2: Trả về toàn bộ danh sách (Array) thay vì chỉ 1 phần tử (Object)
      return result.rows; 
      
    } catch (err) {
      console.error("Lỗi tìm đợt thi active:", err);
      return []; // Trả về mảng rỗng nếu lỗi, thay vì null để tránh crash frontend
    }
  }

  static async create(data) {
    const { TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, TrangThai,lephi } = data;
    const query = `
      INSERT INTO exam_rounds ("TenDot", "NgayThi", "GioThi", "DiaDiem", "SoLuongToiDa", "TrangThai","lephi")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, TrangThai || 'active', lephi];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, data) {
    const { TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, TrangThai, lephi } = data;
    const query = `
      UPDATE exam_rounds
      SET "TenDot" = COALESCE($1, "TenDot"),
          "NgayThi" = COALESCE($2, "NgayThi"),
          "GioThi" = COALESCE($3, "GioThi"),
          "DiaDiem" = COALESCE($4, "DiaDiem"),
          "SoLuongToiDa" = COALESCE($5, "SoLuongToiDa"),
          "TrangThai" = COALESCE($6, "TrangThai"),
          "UpdatedAt" = CURRENT_TIMESTAMP
          "lephi" = COALESCE($7, "lephi"),
      WHERE id = $8
      RETURNING *
    `;
    const values = [TenDot, NgayThi, GioThi, DiaDiem, SoLuongToiDa, TrangThai, lephi, id];
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
