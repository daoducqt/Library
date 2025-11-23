import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function formatVietNamPhoneNumber(phone) {
  if (!phone) throw new Error("Phone number is required");
  
  let formatted = phone.toString().trim();
  if (formatted.startsWith("0")) {
    return "+84" + formatted.slice(1);
  }
  return formatted.startsWith("+") ? formatted : "+" + formatted;
}

export default async function sendSms(phone, otp) {
  try {
    if (!phone || !otp) {
      throw new Error("Phone and OTP are required");
    }
    
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error("TWILIO_PHONE_NUMBER not configured");
    }

    const to = formatVietNamPhoneNumber(phone);
    
    const message = await client.messages.create({
      body: `Mã OTP của bạn là: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    
    console.log(`SMS sent successfully: ${message.sid}`);
    return message;
  } catch (error) {
    console.error("Failed to send SMS:", error.message);
    throw error;
  }
}