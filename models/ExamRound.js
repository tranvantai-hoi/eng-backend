const pool = require('../config/db');

class ExamRound {
  // ... giữ nguyên các hàm findAll, findById ...

  static async findActive() {
    try {
      // Tìm đợt thi có trạng thái 'active'.
      // Lưu ý: Sửa "TrangThai" thành trangthai (thường) hoặc bỏ ngoặc kép để Postgres tự xử lý
      const query = "SELECT * FROM exam_rounds WHERE \"TrangThai\" = 'active' LIMIT 1";
      const result = await pool.query(query);
      return result.rows[0];
    } catch (err) {
      console.error("Lỗi tìm đợt thi active:", err);
      return null;
    }
  }

  static async findAll() {
    try {
      // Tìm đợt thi có trạng thái 'active'.
      // Lưu ý: Sửa "TrangThai" thành trangthai (thường) hoặc bỏ ngoặc kép để Postgres tự xử lý
      const query = "SELECT * FROM exam_rounds order by id";
      const result = await pool.query(query);
      return result.rows[0];
    } catch (err) {
      console.error("Lỗi tìm đợt thi active:", err);
      return null;
    }
  }
  
}

module.exports = ExamRound;
