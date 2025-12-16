const pool = require('../config/db');

class User {
  // Tìm user theo ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    return result.rows[0] ? this.mapUserData(result.rows[0]) : null;
  }

  // Tìm user theo Username (để kiểm tra đăng nhập hoặc trùng tên)
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

  // Thêm user mới
  static async create(username, password, role) {
    const query = `
      INSERT INTO users (username, password, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [username, password, role];
    const result = await pool.query(query, values);
    
    return this.mapUserData(result.rows[0]);
  }

  //Update mật khẩu riêng
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
  
  // Cập nhật thông tin user
  // Dùng COALESCE để nếu truyền null thì giữ nguyên giá trị cũ
  static async update(id, username, password, role) {
    const query = `
      UPDATE users 
      SET 
        username = COALESCE($1, username),
        password = COALESCE($2, password),
        role = COALESCE($3, role)
      WHERE id = $4
      RETURNING *
    `;
    const values = [username, password, role, id];
    const result = await pool.query(query, values);
    
    return result.rows[0] ? this.mapUserData(result.rows[0]) : null;
  }

  // Chuẩn hóa dữ liệu trả về (bỏ password đi nếu không cần thiết, nhưng ở đây tôi giữ raw để controller xử lý)
  static mapUserData(dbRecord) {
    if (!dbRecord) return null;

    return {
      id: dbRecord.id,
      username: dbRecord.username,
      password: dbRecord.password, // Thường sẽ ẩn cái này khi trả về client
      fullname: dbRecord.name, // Thường sẽ ẩn cái này khi trả về client
      role: dbRecord.role
    };
  }
}

module.exports = User;