const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware: Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ----------------------------------------------------
// THIẾT LẬP CẤU HÌNH CORS (BẮT BUỘC CHO KẾT NỐI KHÁC ORIGIN)
// ----------------------------------------------------

// 1. Định nghĩa các Origin (nguồn gốc) được phép truy cập
// Thêm localhost của bạn (nếu frontend đang chạy trên máy) và domain chính thức
// Backend Railway URL: https://eng-backend-production.up.railway.app

const allowedOrigins = [
  'http://localhost:3000', // React, Next.js (mặc định)
  'http://localhost:3001', // Cổng phát triển khác
  'http://localhost:5173', // Vite (rất phổ biến)
  'http://localhost:4200', // Angular (mặc định)
  'http://127.0.0.1:3000', // Cần phải có 127.0.0.1 nếu frontend dùng IP này
  
  // NẾU BẠN ĐÃ TRIỂN KHAI FRONTEND:
  // VÍ DỤ: Nếu frontend của bạn ở https://ten-trang-cua-ban.com
  // THÌ BẠN PHẢI THÊM NÓ VÀO ĐÂY:
  // 'https://ten-trang-cua-ban.com', 
];

const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép các Origin trong danh sách, HOẶC nếu Origin là undefined (yêu cầu từ Postman/Same Origin)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Không được phép bởi CORS: ' + origin));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP được phép
  credentials: true, // Cho phép gửi cookies/header authorization (nếu bạn có dùng auth)
  optionsSuccessStatus: 204
};

// Áp dụng CORS middleware
app.use(cors(corsOptions));

// ----------------------------------------------------
// ĐỊNH NGHĨA ROUTES
// ----------------------------------------------------

app.get('/', (req, res) => res.send('API is running...'));

app.use('/api/exam-rounds', require('./routes/examRoundRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Middleware: Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
module.exports = app;
