const pool = require('../config/db');

class Student {
  static async findByMaSV(masv) {
    try {
      // LƯU Ý QUAN TRỌNG: 
      // PostgreSQL thường yêu cầu tên cột viết hoa phải để trong dấu ngoặc kép " "
      // Chúng ta tìm kiếm bằng cả tên cột có dấu ngoặc và không dấu để chắc chắn bắt được
      const query = `
        SELECT * FROM students 
        WHERE "MaSV" = $1 OR "masv" = $1
        LIMIT 1
      `;
      
      const result = await pool.query(query, [masv]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // --- DATA MAPPING (QUAN TRỌNG) ---
      // Chuyển đổi dữ liệu thô từ Database sang chuẩn API
      // Sử dụng toán tử || để chấp nhận cả trường hợp driver trả về lowercase
      return {
        mssv: row.MaSV || row.masv,
        fullName: row.HoTen || row.hoten,         // DB: HoTen
        dob: row.NgaySinh || row.ngaysinh,        // DB: NgaySinh
        gender: row.GioiTinh || row.gioitinh,     // DB: GioiTinh
        faculty: row.Lop || row.lop,              // DB: Lop -> Mapping sang faculty
        email: row.email || row.Email,            // DB: email
        phone: row.dienthoai || row.DienThoai     // DB: dienthoai
      };

    } catch (error) {
      console.error("Lỗi trong Student.findByMaSV:", error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const query = 'SELECT * FROM students ORDER BY "MaSV" ASC';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Lỗi trong Student.findAll:", error);
      throw error;
    }
  }
}

module.exports = Student;
