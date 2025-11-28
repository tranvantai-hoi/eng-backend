const pool = require('../config/db');

class Student {
  static async findByMaSV(masv) {
    const query = 'SELECT * FROM students WHERE "MaSV" = $1';
    const result = await pool.query(query, [masv]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM students ORDER BY "MaSV"';
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Student;

