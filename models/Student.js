const db = require('../config/db');

class Student {
  static async findByMaSV(masv) {
    try {
      console.log(`🔍 Đang tìm kiếm sinh viên với MSSV: ${masv}`);

      // SỬA LỖI: Sử dụng câu query linh hoạt để tìm cả 'MaSV' (hoa), 'masv' (thường)
      const query = `
        SELECT * FROM students 
        WHERE "MaSV" = $1 OR "masv" = $1 OR "Masv" = $1 
        LIMIT 1
      `;
      
      // Thực thi câu query đã định nghĩa ở trên
      const result = await db.query(query, [masv]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      // MAPPING DỮ LIỆU: Chuyển từ tên cột Database -> Tên biến API (CamelCase)
      // Điều này giúp Frontend luôn nhận được 'fullName', 'dob' dù DB đặt tên gì
      return {
        mssv: row.MaSV || row.masv || row.Masv,
        fullName: row.Hoten || row.hoten || row.HoTen,
        dob: row.ngaysinh || row.NgaySinh || row.dob,
        gender: row.phai || row.Phai || row.gender,
        faculty: row.lop || row.Lop || row.faculty,
        email: row.email || row.Email,
        phone: row.dienthoai || row.DienThoai || row.phone
      };

    } catch (error) {
      // Xử lý trường hợp bảng chưa có cột tương ứng
      console.error("❌ Lỗi SQL trong findByMaSV:", error.message);
      // Thử query đơn giản nếu query phức tạp thất bại
      try {
          const simpleResult = await db.query('SELECT * FROM students WHERE "MaSV" = $1', [masv]);
          if (simpleResult.rows.length > 0) {
             const row = simpleResult.rows[0];
             return {
                mssv: row.MaSV,
                fullName: row.Hoten,
                dob: row.ngaysinh,
                gender: row.phai,
                faculty: row.lop,
                email: row.email,
                phone: row.dienthoai
             };
          }
      } catch(e) { console.error('Retry failed'); }
      
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
