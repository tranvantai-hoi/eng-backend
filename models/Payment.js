const pool = require('../config/db');

class Payment {
  static async create(data) {
    const { RegistrationId, SoTien, PhuongThuc, TrangThai } = data;
    const query = `
      INSERT INTO payments ("RegistrationId", "SoTien", "PhuongThuc", "TrangThai")
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [RegistrationId, SoTien, PhuongThuc || 'momo', TrangThai || 'pending'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM payments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE payments
      SET "TrangThai" = $1, "UpdatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async findByRegistrationId(registrationId) {
    const query = 'SELECT * FROM payments WHERE "RegistrationId" = $1 ORDER BY "CreatedAt" DESC';
    const result = await pool.query(query, [registrationId]);
    return result.rows;
  }
}

module.exports = Payment;

