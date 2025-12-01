const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
// Thêm route cho trang chủ để kiểm tra server hoạt động
app.get('/', (req, res) => {
    res.json({ 
        status: 'success',
        message: 'Server is running normally!',
        timestamp: new Date()
    });
});

// Các API routes hiện có
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/exam-rounds', require('./routes/examRoundRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Error handling middleware
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
