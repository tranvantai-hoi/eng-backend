const pool = require('../config/db');

class Otp {
  // Tạo OTP mới
  static async create({ email, code, expiresInMinutes = 5 }) {
    const query = `
      INSERT INTO otps (email, code, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '${expiresInMinutes} minutes')
      RETURNING *
    `;
    const result = await pool.query(query, [email, code]);
    return result.rows[0];
  }

  // Tìm OTP hợp lệ mới nhất của email
  static async findValidOtp(email, code) {
    const query = `
      SELECT * FROM otps 
      WHERE email = $1 
        AND code = $2 
        AND is_used = FALSE 
        AND expires_at > NOW()
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await pool.query(query, [email, code]);
    return result.rows[0];
  }

  // Đánh dấu OTP đã sử dụng
  static async markAsUsed(id) {
    const query = 'UPDATE otps SET is_used = TRUE WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = Otp;
