const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,    // Gmail
    pass: process.env.MAIL_PASS,    // App password
  },
});

module.exports = transporter;
