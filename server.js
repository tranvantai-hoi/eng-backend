const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./config/db'); // Import kết nối Database

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
// Route kiểm tra trạng thái server và kết nối database
app.get('/', async (req, res) => {
    try {
        // Thử truy vấn đơn giản để kiểm tra kết nối DB
        const result = await db.query('SELECT NOW()');
        res.json({ 
            status: 'success',
            message: 'Server is running and Database is connected!',
            dbTime: result.rows[0].now,
            timestamp: new Date()
        });
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ 
            status: 'error',
            message: 'Server is running but Database connection failed!',
            error: err.message
        });
    }
});

// Các API routes
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/exam-rounds', require('./routes/examRoundRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/otp', require('./routes/registrationRoutes'));

// Error handling middleware
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Kiểm tra kết nối DB khi khởi động server để log ra console
  try {
    const res = await db.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
});
