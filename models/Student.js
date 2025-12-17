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

  // Hàm cập nhật đầy đủ thông tin (cho chức năng Edit)
  static async updateFull(mssv, data) {
    const { fullName, dob, gender, faculty, email, phone } = data;
    const query = `
        UPDATE students 
        SET "HoTen" = $1, "NgaySinh" = $2, "GioiTinh" = $3, "Lop" = $4, email = $5, dienthoai = $6 
        WHERE "MaSV" = $7 
        RETURNING *
    `;
    const values = [fullName, dob, gender, faculty, email, phone, mssv];
    const result = await pool.query(query, values);
    return result.rows[0] ? this.mapStudentData(result.rows[0]) : null;
  }

  // --- [ĐÃ SỬA] Hàm nhập danh sách sinh viên từ Excel (Bulk Import) ---
  // Logic: Nếu MSSV đã tồn tại -> BỎ QUA (DO NOTHING). Nếu chưa có -> THÊM MỚI.
  static async bulkCreate(studentList) {
    const client = await pool.connect(); // Sử dụng client để quản lý Transaction
    
    try {
      await client.query('BEGIN'); // Bắt đầu Transaction
      let count = 0;

      for (const s of studentList) {
        // Query: Thêm mới, nếu trùng MSSV thì BỎ QUA
        const query = `
          INSERT INTO students ("MaSV", "HoTen", "NgaySinh", "GioiTinh", "Lop", "email", "dienthoai")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT ("MaSV") 
          DO NOTHING
        `;
        
        // Đảm bảo dữ liệu ngày tháng hợp lệ hoặc null
        const dob = s.dob ? new Date(s.dob) : null;
        
        const values = [
          s.mssv, 
          s.fullName, 
          dob, 
          s.gender, 
          s.faculty, 
          s.email, 
          s.phone
        ];

        const res = await client.query(query, values);
        
        // Chỉ tăng biến đếm nếu có dòng thực sự được thêm vào (rowCount > 0)
        if (res.rowCount > 0) {
            count++;
        }
      }

      await client.query('COMMIT'); // Xác nhận thay đổi
      return count;

    } catch (error) {
      await client.query('ROLLBACK'); // Hoàn tác nếu có lỗi
      throw error;
    } finally {
      client.release(); // Trả kết nối về pool
    }
  }
// Hàm xóa sinh viên theo id
  static async delete(mssv)
  {
    const query = 'DELETE FROM student WHERE "MaSV" = $1 RETURNING *';
    const result = await pool.query(query, {mssv});
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