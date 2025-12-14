const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (email, code) => {
  return resend.emails.send({
    from: "ENG System <no-reply@ktnlta.store>",
    to: email,
    subject: "Mã OTP xác thực tài khoản",
    html: `
      <div style="font-family: Arial, sans-serif">
        <h2>Mã xác thực OTP</h2>
        <p>Mã OTP của bạn là:</p>
        <div style="
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 4px;
          margin: 12px 0;
        ">
          ${code}
        </div>
        <p>Mã có hiệu lực trong <strong>5 phút</strong>.</p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail };