const pool = require('../config/db');

class Registration {
  // Tìm đăng ký cụ thể theo MaSV và RoundId (Khóa chính tổ hợp)
  static async findById(MaSV, roundId) {
    // Join với bảng students và exam_rounds để lấy đầy đủ thông tin hiển thị
    const query = `
      SELECT r.*, 
             s."HoTen", s."NgaySinh", s."GioiTinh", s."Lop", s."email", s."dienthoai",
             er."TenDot", er."NgayThi", er."GioThi", er."DiaDiem", er."lephi"
      FROM registrations r
      JOIN students s ON r."MaSV" = s."MaSV"
      JOIN exam_rounds er ON r."RoundId" = er.id
      WHERE r."MaSV" = $1 AND r."RoundId" = $2
    `;
    const result = await pool.query(query, [MaSV, roundId]);
    return result.rows[0];
  }

  // Lấy danh sách đăng ký theo Đợt thi (Dùng cho Admin)
  static async findByRoundId(roundId) {
    const query = `
      SELECT r.*, 
             s."HoTen", s."NgaySinh", s."GioiTinh", s."Lop", s."MaSV", 
             er."TenDot"
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
      INSERT INTO registrations ("MaSV", "RoundId", "TrangThai", "CreatedAt")
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    // Đảm bảo trạng thái mặc định là 'pending'
    const values = [MaSV, RoundId, TrangThai || 'pending'];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // [MỚI] Hàm cập nhật điểm thi cho một sinh viên cụ thể
 
  static async updateScores(MaSV, RoundId, scores) {
    const { nghe, noi, doc, viet, ketqua } = scores;
    const query = `
      INSERT INTO registrations ("MaSV", "RoundId", "nghe", "noi", "doc", "viet", "ketqua", "TrangThai", "CreatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'paid', NOW())
      ON CONFLICT ("MaSV", "RoundId") 
      DO UPDATE SET 
        "nghe" = EXCLUDED."nghe",
        "noi" = EXCLUDED."noi",
        "doc" = EXCLUDED."doc",
        "viet" = EXCLUDED."viet",
        "ketqua" = EXCLUDED."ketqua"
      RETURNING *;
    `;
    const values = [MaSV, RoundId, nghe, noi, doc, viet, ketqua];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

 
  // [MỚI] Hàm cập nhật điểm hàng loạt (Dùng cho import từ Excel)
  // @param {Array} scoreList Danh sách các đối tượng chứa: { mssv, roundId, nghe, noi, doc, viet, ketqua }
  
  static async bulkUpdateScores(scoreList) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let totalProcessedCount = 0;

      const chunkSize = 100;
      
      for (let i = 0; i < scoreList.length; i += chunkSize) {
        const chunk = scoreList.slice(i, i + chunkSize);
        
        for (const item of chunk) {
          // Câu lệnh UPSERT: Nếu trùng (MaSV, RoundId) thì Update, nếu không thì Insert mới
          const query = `
            INSERT INTO registrations ("MaSV", "RoundId", "nghe", "noi", "doc", "viet", "ketqua", "TrangThai", "CreatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'paid', NOW())
            ON CONFLICT ("MaSV", "RoundId") 
            DO UPDATE SET 
              "nghe" = EXCLUDED."nghe",
              "noi" = EXCLUDED."noi",
              "doc" = EXCLUDED."doc",
              "viet" = EXCLUDED."viet",
              "ketqua" = EXCLUDED."ketqua"
          `;
          
          const values = [
            item.mssv,
            item.roundId,
            item.nghe !== undefined ? item.nghe : null,
            item.noi !== undefined ? item.noi : null,
            item.doc !== undefined ? item.doc : null,
            item.viet !== undefined ? item.viet : null,
            item.ketqua || null
          ];

          const res = await client.query(query, values);
          if (res.rowCount > 0) totalProcessedCount++;
        }
      }

      await client.query('COMMIT');
      return totalProcessedCount;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Đếm số lượng sinh viên đăng ký trong đợt
static async count(RoundId) {
  const query = `SELECT COUNT(*) as soluong FROM registrations 
                  WHERE "RoundId" = $1 GROUP BY "RoundId"`;
  const result = await pool.query(query, [RoundId]);
  return result.rows[0];
}

  static async checkExisting(MaSV, RoundId) {
    const query = 'SELECT * FROM registrations WHERE "MaSV" = $1 AND "RoundId" = $2';
    const result = await pool.query(query, [MaSV, RoundId]);
    return result.rows[0];
  }

  // [MỚI] Hàm cập nhật trạng thái
  static async updateStatus(MaSV, RoundId, TrangThai) {
    const query = `
      UPDATE registrations
      SET "TrangThai" = $1
      WHERE "MaSV" = $2 AND "RoundId" = $3
      RETURNING *
    `;
    const result = await pool.query(query, [TrangThai, MaSV, RoundId]);
    return result.rows[0];
  }

  static async changeRound(mssv, originalRoundId, roundId) {
    const query = `
      UPDATE registrations
      SET "RoundId" = $3
      WHERE "MaSV" = $1 AND "RoundId" = $2
      RETURNING *
    `;
    const result = await pool.query(query, [mssv, originalRoundId, roundId]);
    return result.rows[0];
  }

  static async delete(MaSV, RoundId) {
    const query = 'DELETE FROM registrations WHERE "MaSV" = $1 AND "RoundId" = $2 RETURNING *';
    const result = await pool.query(query, [MaSV, RoundId]);
    return result.rows[0];
  }
}

module.exports = Registration;