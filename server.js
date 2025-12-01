const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Đảm bảo thư viện cors đã được import
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware: BẬT CORS (Cho phép kết nối từ mọi Origin - '*')
app.use(cors()); 

// Middleware: Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
