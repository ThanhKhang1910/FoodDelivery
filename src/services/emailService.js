const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
      ? process.env.EMAIL_PASS.replace(/ /g, "")
      : "",
  },
});

const sendOrderCompletedEmail = async (toEmail, customerName, orderId) => {
  if (!toEmail) {
    console.log("No email provided, skipping notification.");
    return;
  }

  const mailOptions = {
    from: `"BronAuto Food" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `✅ Đơn hàng #${orderId} đã giao thành công!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Chúc ngon miệng! 🍽️</h2>
        <p>Xin chào <strong>${customerName}</strong>,</p>
        <p>Đơn hàng <strong>#${orderId}</strong> của bạn đã được giao thành công.</p>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của BronAuto. Hy vọng bạn sẽ có một bữa ăn thật ngon miệng!</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:3000/orders" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xem lại đơn hàng</a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">Đây là email tự động, vui lòng không trả lời.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${toEmail} for Order #${orderId}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = { sendOrderCompletedEmail };
