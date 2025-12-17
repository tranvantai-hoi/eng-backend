const pool = require('../config/db');

class User {
  // Tìm user theo ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapUserData(result.rows[0]) : null;
  }

  // Tìm user theo Username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0] ? this.mapUserData(result.rows[0]) : null;
  }

  // Lấy danh sách tất cả users
  static async findAll() {
    const query = 'SELECT * FROM users ORDER BY id';
    const result = await pool.query(query);
    return result.rows.map(row => this.mapUserData(row));
  }

  // Thêm user mới (Cập nhật SQL để insert fullname)
  static async create(username, password, role, fullname) {
    const query = `
      INSERT INTO users (username, password, role, name)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    // Nếu fullname không có, truyền null (hoặc chuỗi rỗng tùy DB)
    const values = [username, password, role, fullname || null];
    const result = await pool.query(query, values);
    
    return this.mapUserData(result.rows[0]);
  }

  // Cập nhật thông tin user (Cập nhật SQL để update fullname)
  static async update(id, username, password, role, fullname) {
    const query = `
      UPDATE users 
      SET 
        username = COALESCE($1, username),
        password = COALESCE($2, password),
        role = COALESCE($3, role),
        name = COALESCE($4, name)
      WHERE id = $5
      RETURNING *
    `;
    const values = [username, password, role, fullname, id];
    const result = await pool.query(query, values);
    
    return result.rows[0] ? this.mapUserData(result.rows[0]) : null;
  }

static async delete(id) {
  const query=`
    DELETE FROM users
    WHERE id = $1
    RETURNING *
    `;
  const result = await pool.query(query, [id]);
  return result.rows[0]
}


  // Đổi mật khẩu
  static async updatePassword(id, hashedPassword) {
    const query = `
      UPDATE users 
      SET password = $1 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rows[0] ? this.mapUserData(result.rows[0]) : null;
  }

  // Chuẩn hóa dữ liệu trả về
  static mapUserData(dbRecord) {
    if (!dbRecord) return null;

    return {
      id: dbRecord.id,
      username: dbRecord.username,
      password: dbRecord.password, 
      role: dbRecord.role,
      fullname: dbRecord.name // Trả về fullname
    };
  }
}

module.exports = User;