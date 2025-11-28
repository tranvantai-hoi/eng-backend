-- Create tables for English Exam Registration System

-- Students table
CREATE TABLE IF NOT EXISTS students (
    "MaSV" VARCHAR(50) PRIMARY KEY,
    "HoTen" VARCHAR(255) NOT NULL,
    "Lop" VARCHAR(50),
    "NgaySinh" DATE,
    "GioiTinh" VARCHAR(10),
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam Rounds table
CREATE TABLE IF NOT EXISTS exam_rounds (
    id SERIAL PRIMARY KEY,
    "TenDot" VARCHAR(255) NOT NULL,
    "NgayThi" DATE NOT NULL,
    "GioThi" TIME NOT NULL,
    "DiaDiem" VARCHAR(255) NOT NULL,
    "SoLuongToiDa" INTEGER NOT NULL,
    "TrangThai" VARCHAR(50) DEFAULT 'active',
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    "MaSV" VARCHAR(50) NOT NULL REFERENCES students("MaSV") ON DELETE CASCADE,
    "RoundId" INTEGER NOT NULL REFERENCES exam_rounds(id) ON DELETE CASCADE,
    "TrangThai" VARCHAR(50) DEFAULT 'pending',
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("MaSV", "RoundId")
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    "RegistrationId" INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    "SoTien" DECIMAL(10, 2) NOT NULL,
    "PhuongThuc" VARCHAR(50) DEFAULT 'momo',
    "TrangThai" VARCHAR(50) DEFAULT 'pending',
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registrations_masv ON registrations("MaSV");
CREATE INDEX IF NOT EXISTS idx_registrations_roundid ON registrations("RoundId");
CREATE INDEX IF NOT EXISTS idx_payments_registrationid ON payments("RegistrationId");

