import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Gửi email
 * @param {Object} options
 * @param {string} options.to - email người nhận
 * @param {string} [options.subject] - tiêu đề
 * @param {string} [options.text] - nội dung text
 * @param {string} [options.html] - nội dung html
 */
export default async function sendMail(options) {
    if (!options || !options.to) throw new Error("sendMail: 'to' is required");
    if (!process.env.EMAIL_USER) throw new Error("sendMail: EMAIL_USER not configured");

    const { to, subject, text, html } = options; // ← lấy từ options

    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: subject || "Thông báo từ hệ thống",
        text: text || undefined,
        html: html || undefined,
    });
}