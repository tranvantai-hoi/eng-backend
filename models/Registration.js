const pool = require('../config/db');

class Registration {
  static async findById(id) {
    const query = 'SELECT * FROM registrations WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByRoundId(roundId) {
    const query = `
      SELECT r.*, s."HoTen", s."Lop", s."MaSV", er."TenDot", er."NgayThi", er."GioThi"
      FROM registrations r
      JOIN students s ON r."MaSV" = s."MaSV"
      JOIN exam_rounds er ON r."RoundId" = er.id
      WHERE r."RoundId" = $1
      ORDER BY r."CreatedAt" DESC
    `;
    const result = await pool.query(query, [roundId]);
    return result.rows;
  }

  static async create(data) {
    const { MaSV, RoundId, TrangThai } = data;
    const query = `
      INSERT INTO registrations ("MaSV", "RoundId", "TrangThai")
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [MaSV, RoundId, TrangThai || 'pending'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async checkExisting(MaSV, RoundId) {
    const query = 'SELECT * FROM registrations WHERE "MaSV" = $1 AND "RoundId" = $2';
    const result = await pool.query(query, [MaSV, RoundId]);
    return result.rows[0];
  }
}

module.exports = Registration;
