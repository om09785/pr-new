// order.js (Fakeer Delites - email only)

const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const OWNER_EMAIL = "shaikhshajaan2@gmail.com";

const BRAND_NAME = "Fakeer Delites";

exports.handler = async (request, context) => {
  try {
    if (request.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          message: "Only POST allowed",
        }),
      };
    }

    const body = JSON.parse(request.body || "{}");
    const {
      name,
      phone,
      email,
      address,
      deliveryType,
      deliveryDate,
      deliveryTime,
      drink,
      size,
      quantity,
      paymentMethod,
      notes,
    } = body;

    if (!name || !phone || !drink || !quantity) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          message: "Please fill name, phone, item and quantity.",
        }),
      };
    }

    const text =
      `New ${BRAND_NAME} Order/Inquiry\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Email: ${email || "-"}\n` +
      `Address: ${address || "-"}\n` +
      `Delivery Type: ${deliveryType || "-"}\n` +
      `Delivery Date: ${deliveryDate || "-"}\n` +
      `Delivery Time: ${deliveryTime || "-"}\n` +
      `Item/Dish: ${drink}\n` +
      `Portion/Size: ${size || "-"}\n` +
      `Quantity: ${quantity}\n` +
      `Payment Method: ${paymentMethod || "-"}\n` +
      `Notes: ${notes || "-"}\n`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${BRAND_NAME} Website" <${EMAIL_USER}>`,
      to: OWNER_EMAIL,
      subject: `New ${BRAND_NAME} Order/Inquiry`,
      text,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "Order sent successfully! We will contact you soon.",
      }),
    };
  } catch (err) {
    console.error("Error sending Fakeer Delites order email:", err);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        message: "Error sending order.",
      }),
    };
  }
};



