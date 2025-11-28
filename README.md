# English Exam Registration Backend

Backend API cho hệ thống đăng ký thi tiếng Anh sử dụng Node.js + Express + PostgreSQL.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình biến môi trường trong file `.env`:
```
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=development
```

4. Tạo database schema:
```bash
psql -h <host> -U <user> -d <database> -f database/schema.sql
```

Hoặc chạy các lệnh SQL trong file `database/schema.sql` trên PostgreSQL của bạn.

## Chạy ứng dụng

Development mode (với nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server sẽ chạy tại `http://localhost:3000`

## API Endpoints

### Students
- `GET /students` - Lấy danh sách tất cả sinh viên
- `GET /students?masv=<MaSV>` - Tìm sinh viên theo mã sinh viên

### Exam Rounds
- `GET /rounds` - Lấy danh sách tất cả đợt thi
- `POST /rounds` - Tạo đợt thi mới
- `PUT /rounds/:id` - Cập nhật đợt thi
- `DELETE /rounds/:id` - Xóa đợt thi

### Registrations
- `POST /register` - Đăng ký thi
- `GET /register/:id` - Lấy thông tin đăng ký theo ID
- `GET /register/by-round/:roundId` - Lấy danh sách đăng ký theo đợt thi

### Payments
- `POST /payment/create` - Tạo thanh toán (demo)
- `POST /payment/callback` - Callback thanh toán (demo)

## Cấu trúc thư mục

```
eng-backend/
├── config/
│   └── db.js              # Database configuration
├── controllers/            # Business logic
│   ├── studentController.js
│   ├── examRoundController.js
│   ├── registrationController.js
│   └── paymentController.js
├── models/                 # Database models
│   ├── Student.js
│   ├── ExamRound.js
│   ├── Registration.js
│   └── Payment.js
├── routes/                 # API routes
│   ├── studentRoutes.js
│   ├── examRoundRoutes.js
│   ├── registrationRoutes.js
│   └── paymentRoutes.js
├── middleware/
│   └── errorHandler.js     # Error handling middleware
├── database/
│   └── schema.sql          # Database schema
├── server.js               # Main server file
├── package.json
└── .env.example
```

## Ví dụ sử dụng API

### Tạo đợt thi mới
```bash
POST /rounds
Content-Type: application/json

{
  "TenDot": "Đợt thi tháng 12/2024",
  "NgayThi": "2024-12-15",
  "GioThi": "08:00:00",
  "DiaDiem": "Phòng A101",
  "SoLuongToiDa": 50,
  "TrangThai": "active"
}
```

### Đăng ký thi
```bash
POST /register
Content-Type: application/json

{
  "MaSV": "SV001",
  "RoundId": 1,
  "TrangThai": "pending"
}
```

### Tạo thanh toán
```bash
POST /payment/create
Content-Type: application/json

{
  "RegistrationId": 1,
  "SoTien": 500000,
  "PhuongThuc": "momo",
  "TrangThai": "pending"
}
```

## Lưu ý

- Payment endpoints hiện đang ở chế độ demo, chưa tích hợp với Momo thực tế
- Database sử dụng PostgreSQL với SSL connection (Railway)
- Tất cả controllers đều có try/catch error handling
- Error handler middleware xử lý các lỗi database và validation

