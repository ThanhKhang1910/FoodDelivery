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

const sendOrderCompletedEmail = async (orderData) => {
  const {
    email,
    customerName,
    orderId,
    restaurantName,
    restaurantAddress,
    customerAddress,
    items,
    subtotal,
    shippingFee,
    discount,
    total,
    orderTime,
  } = orderData;

  if (!email) {
    console.log("No email provided, skipping notification.");
    return;
  }

  // Format currency
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
        <div style="font-weight: bold;">${item.item_name}</div>
        <div style="color: #666; font-size: 12px;">x${item.quantity}</div>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">
        ${formatMoney(item.price * item.quantity)}
      </td>
    </tr>
  `,
    )
    .join("");

  const mailOptions = {
    from: `"BronAuto Food" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Hóa đơn điện tử - Đơn hàng #${orderId}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
        
        <!-- Header Green -->
        <div style="background-color: #00b14f; padding: 20px; text-align: left;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Chúc bạn ngon miệng!</h1>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Summary Top -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; align-items: baseline;">
            <div>
              <div style="font-size: 14px; color: #666;">Tổng cộng</div>
              <div style="font-size: 28px; font-weight: bold; color: #00b14f;">${formatMoney(total)}</div>
            </div>
            <div style="text-align: right; font-size: 13px; color: #666;">
              <div>Mã: #${orderId}</div>
              <div>${new Date(orderTime).toLocaleString("vi-VN")}</div>
            </div>
          </div>

          <hr style="border: none; border-top: 1px dashed #ddd; margin: 20px 0;" />

          <!-- Order Info -->
          <div style="font-size: 14px; margin-bottom: 20px;">
            <div style="margin-bottom: 10px;">
              <strong>Nhà hàng:</strong> ${restaurantName || "Nhà hàng"}<br/>
              <span style="color: #666;">📍 ${restaurantAddress || "Đang cập nhật"}</span>
            </div>
            <div style="margin-bottom: 10px;">
              <strong>Người nhận:</strong> ${customerName}<br/>
              <span style="color: #666;">📍 ${customerAddress}</span>
            </div>
          </div>

          <!-- Bill Details -->
          <div style="background-color: #fafafa; padding: 15px; border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              ${itemRows}
            </table>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Tổng tạm tính</span>
                <span>${formatMoney(subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Phí giao hàng</span>
                <span>${formatMoney(shippingFee)}</span>
              </div>
              ${
                discount > 0
                  ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #00b14f;">
                <span>Giảm giá</span>
                <span>-${formatMoney(discount)}</span>
              </div>`
                  : ""
              }
              <div style="display: flex; justify-content: space-between; margin-top: 10px; font-weight: bold; font-size: 16px;">
                <span>BẠN TRẢ</span>
                <span>${formatMoney(total)}</span>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
            Cảm ơn bạn đã sử dụng BronAuto Food.<br/>
            Đây là email tự động.
          </div>

        </div>
      </div>
    `,
  };

  console.log(`[EmailService] Receipt preparing for ${email}...`);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Receipt Sent! MsgID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ [EmailService] FAILED: ${error.message}`);
    // Log full error for debugging
    if (error.response) console.error("SMTP Response:", error.response);
  }
};

module.exports = { sendOrderCompletedEmail };
