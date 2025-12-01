const db = require('../config/db');

class Student {
  static async findByMaSV(masv) {
    try {
      console.log(`🔍 Đang tìm kiếm sinh viên với MSSV: ${masv}`);

      // 1. Sửa câu Query: Bỏ ngoặc kép "" để PostgreSQL tự xử lý (linh hoạt hơn)
      // Sử dụng $1 để tránh SQL Injection
      const query = 'SELECT * FROM students WHERE "MaSV" = $1 OR "masv" = $1 OR masv = $1 LIMIT 1';
      
      // Nếu bạn chắc chắn tên cột trong DB, hãy dùng câu đơn giản: 
      // const query = 'SELECT * FROM students WHERE masv = $1'; 

      const result = await db.query('SELECT * FROM students WHERE "MaSV" = $1', [masv]);
      // Lưu ý: Nếu dòng trên lỗi, hãy thử đổi thành: 
      // const result = await db.query('SELECT * FROM students WHERE masv = $1', [masv]);

      if (result.rows.length === 0) {
        console.log("⚠️ Không tìm thấy bản ghi nào trong Database.");
        return null;
      }

      const row = result.rows[0];
      console.log("✅ Dữ liệu thô từ DB:", row); // Xem log này để biết tên cột chính xác là 'Hoten' hay 'hoten'

      // 2. Mapping dữ liệu an toàn (Chấp nhận cả viết hoa/thường)
      // Database trả về column thường là lowercase trong object row
      return {
        mssv: row.MaSV || row.masv || row.Masv,
        fullName: row.Hoten || row.hoten || row.HoTen,
        dob: row.ngaysinh || row.NgaySinh || row.dob,
        gender: row.phai || row.Phai || row.gender,
        faculty: row.lop || row.Lop || row.faculty, // Giả sử 'lop' tương đương 'faculty'
        email: row.email || row.Email,
        phone: row.dienthoai || row.DienThoai || row.phone
      };

    } catch (error) {
      console.error("❌ Lỗi SQL trong findByMaSV:", error.message);
      // Không throw error để server không bị crash, trả về null
      return null;
    }
  }

  static async findAll() {
    try {
      const result = await db.query('SELECT * FROM students');
      return result.rows.map(row => ({
        mssv: row.MaSV || row.masv,
        fullName: row.Hoten || row.hoten,
        dob: row.ngaysinh || row.NgaySinh,
        gender: row.phai || row.Phai,
        faculty: row.lop || row.Lop,
        email: row.email || row.Email,
        phone: row.dienthoai || row.DienThoai
      }));
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }
}

module.exports = Student;
