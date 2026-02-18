// netlify/functions/order.js (Fakeer Delites + WhatsApp)

const nodemailer = require("nodemailer");
const fetch = require("node-fetch");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const OWNER_EMAIL = "satputeo210@gmail.com";

const BRAND_NAME = "Fakeer Delites";

const WA_TOKEN = process.env.WA_TOKEN;
const WA_PHONE_ID = process.env.WA_PHONE_ID;
const WA_TO = process.env.WA_TO;

async function sendWhatsApp(bodyText) {
  if (!WA_TOKEN || !WA_PHONE_ID || !WA_TO) {
    console.warn("WhatsApp env vars missing, skipping WhatsApp send.");
    return;
  }

  const url = `https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: WA_TO,
      type: "text",
      text: { body: bodyText },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("WhatsApp API error:", errText);
  }
}

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

    await sendWhatsApp(text);

    console.log("DEBUG: sendWhatsApp called");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "Order sent successfully! We will contact you soon.",
      }),
    };
  } catch (err) {
    console.error("Error sending Fakeer Delites order email/WhatsApp:", err);

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
