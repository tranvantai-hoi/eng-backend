const pool = require('../config/db');

class ExamRound {
  // ... giữ nguyên các hàm findAll, findById ...

 static async findActive() {
    try {
      // SỬA LỖI:
      // 1. Bỏ ngoặc kép quanh tên cột (để Postgres tự hiểu là trangthai hoặc TrangThai)
      // 2. Dùng ILIKE để so sánh không phân biệt hoa thường (Active, active, ACTIVE đều nhận)
      const query = "SELECT * FROM exam_rounds";// WHERE \"TrangThai\" ILIKE 'active' LIMIT 1";
      
      const result = await pool.query(query);
      return result.rows[0];
    } catch (err) {
      console.error("Lỗi tìm đợt thi active:", err);
      return null;
    }
  }

  static async findAll() {
    try {
      // Tìm đợt thi 
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
