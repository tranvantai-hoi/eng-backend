const pool = require('../config/db');

class Student {
  // Hàm tìm kiếm sinh viên theo MSSV
  static async findByMaSV(masv) {
    // Lưu ý: Cần select đúng tên cột trong DB của bạn
    const query = 'SELECT * FROM students WHERE "MaSV" = $1';
    const result = await pool.query(query, [masv]);
    
    // Nếu có kết quả, map dữ liệu trước khi trả về
    return result.rows[0] ? this.mapStudentData(result.rows[0]) : null;
  }

  // Hàm lấy tất cả sinh viên (nếu cần)
  static async findAll() {
    const query = 'SELECT * FROM students ORDER BY "MaSV"';
    const result = await pool.query(query);
    
    // Map toàn bộ danh sách
    return result.rows.map(row => this.mapStudentData(row));
  }

  async updateContact(mssv, email, phone) {
    // Sửa tên bảng 'sinhvien' và các cột 'Email', 'DienThoai' cho đúng DB của bạn
    const query = `
        UPDATE students 
        SET email = $1, dienthoai = $2 
        WHERE MaSV = $3 
        RETURNING *
    `;
    const values = [email, phone, mssv];
    
    // Giả sử bạn đang dùng 'pool' để query
    const result = await pool.query(query, values);
    return result.rows[0];
}
  // --- HÀM CHUẨN HÓA DỮ LIỆU (MAPPING) ---
  // Chuyển đổi từ tên cột trong DB (bên phải) sang tên biến Frontend (bên trái)
  static mapStudentData(dbRecord) {
    if (!dbRecord) return null;

    return {
      // Frontend: mssv  <-- DB: MaSV
      mssv: dbRecord.MaSV,
      
      // Frontend: fullName <-- DB: HoTen
      fullName: dbRecord.HoTen,
      
      // Frontend: dob <-- DB: NgaySinh
      dob: dbRecord.NgaySinh,
      
      // Frontend: gender <-- DB: GioiTinh (Xử lý chuẩn hóa Nam/Nữ)
      gender: dbRecord.GioiTinh,

      // Frontend: faculty <-- DB: Lop
      faculty: dbRecord.Lop,
      
      // Frontend: email <-- DB: email
      email: dbRecord.email,
      
      // Frontend: phone <-- DB: dienthoai
      phone: dbRecord.dienthoai
    };
  }

  
}

module.exports = Student;
