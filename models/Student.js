const pool = require('../config/db');

class Student {
  static async findByMaSV(masv) {
    try {
      // CHỈ DÙNG TÊN CỘT CÓ DẤU NGOẶC KÉP NẾU DB BẠN DÙNG CHỮ HOA
      const query = 'SELECT * FROM students WHERE "MaSV" = $1';
      const result = await pool.query(query, [masv]);
      return result.rows[0];
    } catch (error) {
      // Fallback: Nếu lỗi không tìm thấy cột, thử tìm bằng chữ thường
      if (error.code === '42703') {
         const result = await pool.query('SELECT * FROM students WHERE masv = $1', [masv]);
         return result.rows[0];
      }
      throw error;
    }
  }
  
  static async updateContactInfo(masv, email, phone) {
    try {
        const query = 'UPDATE students SET email = $1, dienthoai = $2 WHERE "MaSV" = $3 RETURNING *';
        const result = await pool.query(query, [email, phone, masv]);
        return result.rows[0];
    } catch (e) { return null; }
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM students');
    return result.rows;
  }
}
module.exports = Student;
