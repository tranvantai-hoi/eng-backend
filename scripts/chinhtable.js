/* Tạo mật khẩu
const bcrypt = require('bcryptjs');

const password = '123456';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  console.log('Mật khẩu: ' + password);
  console.log('Chuỗi mã hóa (Copy cái này vào DB):');
  console.log(hash);
});

*/

const pool = require('../config/db'); // Đường dẫn tới file config db của bạn

const updateSchema = async () => {
  const client = await pool.connect();
  try {
    console.log('--- Bắt đầu cập nhật cấu trúc bảng registrations ---');

    // Câu lệnh SQL thêm 5 cột mới
    const sql = `
      ALTER TABLE registrations 
      ADD COLUMN IF NOT EXISTS "nghe" DECIMAL(5, 2),
      ADD COLUMN IF NOT EXISTS "noi" DECIMAL(5, 2),
      ADD COLUMN IF NOT EXISTS "doc" DECIMAL(5, 2),
      ADD COLUMN IF NOT EXISTS "viet" DECIMAL(5, 2),
      ADD COLUMN IF NOT EXISTS "ketqua" VARCHAR(50);
    `;

    await client.query(sql);
    console.log('✅ Cập nhật thành công: Đã thêm các cột nghe, noi, doc, viet, ketqua.');

  } catch (err) {
    console.error('❌ Lỗi khi cập nhật database:', err.message);
  } finally {
    client.release();
    process.exit(); 
  }
};

updateSchema();// Tạo các cột mới cho bảng