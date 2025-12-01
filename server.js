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
// Backend Railway URL: https://eng-backend-production.up.railway.app
const allowedOrigins = [
  'http://localhost:3000', // React, Next.js (mặc định)
  'http://localhost:3001', 
  'http://localhost:5173', // Vite (rất phổ biến)
  'http://localhost:4200', // Angular (mặc định)
  'http://127.0.0.1:3000', 
  // NẾU BẠN ĐÃ TRIỂN KHAI FRONTEND:
  // THAY THẾ DÒNG DƯỚI ĐÂY BẰNG URL FRONTEND THỰC TẾ CỦA BẠN
  // VÍ DỤ: 'https://ten-frontend-cua-ban.com',
  // HOẶC NẾU FRONTEND CŨNG Ở RAILWAY (ví dụ: https://eng-frontend-xyz.up.railway.app)
  // THÌ PHẢI THÊM NÓ VÀO ĐÂY.
];

const corsOptions = {
  origin: function (origin, callback) {
    // Logic kiểm tra an toàn hơn:
    // 1. Cho phép nếu không có Origin (yêu cầu từ server-side hoặc Postman/cùng nguồn gốc)
    // 2. Hoặc Origin nằm trong danh sách cho phép (allowedOrigins)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In ra lỗi chi tiết để debug
      console.error('CORS blocked request from origin: ' + origin);
      callback(new Error('Không được phép bởi CORS: ' + origin));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
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
