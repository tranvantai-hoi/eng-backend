-- SCHEMA.JS - Cấu trúc cơ sở dữ liệu cho Hệ thống Đăng ký Kiểm tra Năng lực

-- 1. Bảng Users (Quản trị viên/Giáo viên) [Dựa trên User.js]
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'teacher',
    name VARCHAR(100), -- Cột fullname trong model
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Students (Sinh viên) [Dựa trên Student.js]
CREATE TABLE IF NOT EXISTS students (
    "MaSV" VARCHAR(20) PRIMARY KEY,
    "HoTen" VARCHAR(100) NOT NULL,
    "NgaySinh" DATE,
    "GioiTinh" VARCHAR(10),
    "Lop" VARCHAR(50),
    email VARCHAR(100),
    dienthoai VARCHAR(20),
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Exam Rounds (Đợt thi) [Dựa trên ExamRound.js]
CREATE TABLE IF NOT EXISTS exam_rounds (
    id SERIAL PRIMARY KEY,
    "TenDot" VARCHAR(100) NOT NULL,
    "NgayThi" DATE NOT NULL,
    "GioThi" TIME,
    "DiaDiem" VARCHAR(255),
    "SoLuongToiDa" INTEGER DEFAULT 0,
    "lephi" DECIMAL(12, 2) DEFAULT 0, -- Tương ứng cột lephi trong model
    "TrangThai" VARCHAR(20) DEFAULT 'active',
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Registrations (Đăng ký & Điểm thi) [Dựa trên Registration.js + Yêu cầu mới]
CREATE TABLE IF NOT EXISTS registrations (
    "MaSV" VARCHAR(20) REFERENCES students("MaSV") ON DELETE CASCADE,
    "RoundId" INTEGER REFERENCES exam_rounds(id) ON DELETE CASCADE,
    "TrangThai" VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
    
    -- Các cột điểm thi mới bổ sung
    "nghe" DECIMAL(5, 2),
    "noi" DECIMAL(5, 2),
    "doc" DECIMAL(5, 2),
    "viet" DECIMAL(5, 2),
    "ketqua" VARCHAR(50), -- Lưu trạng thái Đạt/Không đạt hoặc tổng điểm
    
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("MaSV", "RoundId") -- Khóa chính tổ hợp
);

-- 5. Bảng Payments (Thanh toán) [Dựa trên Payment.js]
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    "RegistrationId" VARCHAR(100), -- Lưu thông tin định danh đăng ký
    "SoTien" DECIMAL(12, 2) NOT NULL,
    "PhuongThuc" VARCHAR(20) DEFAULT 'vietqr', -- Đổi mặc định sang vietqr theo yêu cầu trước đó
    "TrangThai" VARCHAR(20) DEFAULT 'pending',
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng Otps (Mã xác thực) [Dựa trên otp.js]
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    code INTEGER NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index để tối ưu tìm kiếm
CREATE INDEX IF NOT EXISTS idx_registrations_round ON registrations("RoundId");
CREATE INDEX IF NOT EXISTS idx_students_masv ON students("MaSV");
CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);