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
// THIẾT LẬP CẤU HÌNH CORS ĐƠN GIẢN VÀ AN TOÀN NHẤT
// Sử dụng cấu hình cơ bản nhất (wildcard '*') để đảm bảo kết nối
// từ mọi nguồn gốc (Origin) trong môi trường phát triển (Development).
// ----------------------------------------------------

app.use(cors());

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
