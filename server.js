const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Đảm bảo thư viện cors đã được import
const pool = require('./config/db'); // [ĐÃ SỬA] Đổi tên biến import thành 'pool' vì db.js export Pool object
const { errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Khởi tạo Express
const app = express();

// Middleware: BẬT CORS (Cho phép kết nối từ mọi Origin - '*')
// Đây là giải pháp đơn giản nhất để khắc phục lỗi kết nối frontend
app.use(cors()); 

// Middleware: Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ----------------------------------------------------
// LƯU Ý VỀ KẾT NỐI DB:
// Vì file config/db.js export đối tượng Pool (module.exports = pool),
// việc kết nối và lắng nghe sự kiện 'connect' đã được xử lý trong file đó.
// Không cần gọi một hàm kết nối cụ thể ở đây. 
// Biến 'pool' đã sẵn sàng để được sử dụng trong các controllers.
// ----------------------------------------------------

// ĐỊNH NGHĨA ROUTES
app.get('/', (req, res) => res.send('API is running...'));

app.use('/api/exam-rounds', require('./routes/examRoundRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Middleware: Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
