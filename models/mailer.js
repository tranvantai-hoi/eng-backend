const nodemailer = require('nodemailer');
require('dotenv').config();

// Cấu hình Transporter (người vận chuyển)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Hàm gửi mail
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"Hệ thống đăng ký kiểm tra năng lực Tiếng Anh" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent, // Nội dung HTML đẹp hơn text thường
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };
