import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export default async function sendMail(to, text) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Mã OTP xác thực tài khoản:",
        text,
    });
}