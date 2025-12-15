const pool = require('../config/db');

class Student {
  // Hàm tìm kiếm sinh viên theo MSSV
  static async findByMaSV(masv) {
    const query = 'SELECT * FROM students WHERE "MaSV" = $1';
    const result = await pool.query(query, [masv]);
    
    return result.rows[0] ? this.mapStudentData(result.rows[0]) : null;
  }

  // Hàm lấy tất cả sinh viên
  static async findAll() {
    const query = 'SELECT * FROM students ORDER BY "MaSV"';
    const result = await pool.query(query);
    
    return result.rows.map(row => this.mapStudentData(row));
  }

  // --- ĐÃ SỬA: Thêm 'static' và sửa câu query ---
  static async updateContact(mssv, email, phone) {
    const query = `
        UPDATE students 
        SET email = $1, dienthoai = $2 
        WHERE "MaSV" = $3 
        RETURNING *
    `;
    const values = [email, phone, mssv];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Hàm chuẩn hóa dữ liệu
  static mapStudentData(dbRecord) {
    if (!dbRecord) return null;

    return {
      mssv: dbRecord.MaSV,
      fullName: dbRecord.HoTen,
      dob: dbRecord.NgaySinh,
      gender: dbRecord.GioiTinh,
      faculty: dbRecord.Lop,
      email: dbRecord.email,
      phone: dbRecord.dienthoai
    };
  }
}

module.exports = Student;