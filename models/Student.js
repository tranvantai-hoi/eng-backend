const pool = require('../config/db');

class Student {
  // Hàm hỗ trợ thực thi query an toàn
  static async safeQuery(masv) {
    // CÁCH 1: Thử query với tên cột Có Ngoặc Kép (Case-sensitive) - Ưu tiên cấu trúc bạn cung cấp
    try {
      const query = 'SELECT * FROM students WHERE "MaSV" = $1';
      const result = await pool.query(query, [masv]);
      return result;
    } catch (err) {
      // Nếu lỗi là "Undefined Column" (42703), nghĩa là trong DB lưu tên cột kiểu khác
      if (err.code === '42703') {
        console.log("⚠️ Không tìm thấy cột \"MaSV\", đang thử lại với cột 'masv'...");
        // CÁCH 2: Thử query với tên cột thường (Default Postgres)
        const queryFallback = 'SELECT * FROM students WHERE masv = $1';
        return await pool.query(queryFallback, [masv]);
      }
      throw err; // Các lỗi khác (mất mạng, sai pass...) thì ném ra ngoài
    }
  }

  static async findByMaSV(masv) {
    try {
      const result = await this.safeQuery(masv);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      // Log dữ liệu thô để debug (nếu cần)
      // console.log("Dữ liệu thô từ DB:", row);

      // --- MAPPING DỮ LIỆU CHÍNH XÁC ---
      // Cột DB: MaSV, HoTen, Lop, NgaySinh, GioiTinh, email, dienthoai
      // Sử dụng || để lấy giá trị dù DB trả về chữ hoa hay thường
      return {
        mssv: row.MaSV || row.masv || row.Masv,
        fullName: row.HoTen || row.hoten || row.HOTEN,      // DB: HoTen
        dob: row.NgaySinh || row.ngaysinh,                  // DB: NgaySinh
        gender: row.GioiTinh || row.gioitinh,               // DB: GioiTinh
        faculty: row.Lop || row.lop,                        // DB: Lop
        email: row.email || row.Email,                      // DB: email (thường là chữ thường)
        phone: row.dienthoai || row.DienThoai               // DB: dienthoai (thường là chữ thường)
      };

    } catch (error) {
      console.error("❌ Lỗi Student.findByMaSV:", error.message);
      throw error;
    }
  }

  static async findAll() {
    try {
      // Query lấy danh sách cũng cần an toàn
      try {
        const result = await pool.query('SELECT * FROM students ORDER BY "MaSV" ASC');
        return result.rows;
      } catch (e) {
        const result = await pool.query('SELECT * FROM students ORDER BY masv ASC');
        return result.rows;
      }
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }
}

module.exports = Student;
