const pool = require('../config/db');

class Student {
  static async findByMaSV(masv) {
    try {
      // Truy vấn tìm kiếm. Dùng OR để tìm cả trường hợp tên cột là "MaSV" (có ngoặc kép) hoặc masv (thường)
      // Điều này giúp tránh lỗi "column does not exist" trong PostgreSQL
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

      // --- MAPPING DỮ LIỆU CHUẨN ---
      // Chuyển đổi chính xác từ cột Database (bạn cung cấp) -> API Standard
      // Sử dụng toán tử || để chấp nhận cả trường hợp Postgres trả về tên cột chữ thường (mặc định)
      return {
        mssv: row.MaSV || row.masv,
        fullName: row.HoTen || row.hoten,           // DB: HoTen
        dob: row.NgaySinh || row.ngaysinh,          // DB: NgaySinh
        gender: row.GioiTinh || row.gioitinh,       // DB: GioiTinh (Đã sửa từ 'phai')
        faculty: row.Lop || row.lop,                // DB: Lop
        email: row.email || row.Email,              // DB: email
        phone: row.dienthoai || row.DienThoai       // DB: dienthoai
      };

    } catch (error) {
      console.error("Lỗi SQL trong Student.findByMaSV:", error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const query = 'SELECT * FROM students ORDER BY "MaSV" ASC';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }
}

module.exports = Student;
