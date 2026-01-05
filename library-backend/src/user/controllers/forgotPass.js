import Joi from "joi";
import User from "../models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import sendMail from "../../../core/utils/sendMail.js";

const validate = Joi.object({
  email: Joi.string().email().required().trim().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
});

const excecute = async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        message: "Nếu email tồn tại, mã OTP đã được gửi. Vui lòng kiểm tra hộp thư.",
      });
    }

    // Tạo OTP (6 chữ số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    // Lưu OTP vào DB
    user.otpCode = otp;
    user.otpExpires = otpExpires;
    user.otpPurpose = "reset_password";
    await user.save();

    // Gửi OTP qua email
    try {
      await sendMail({
        to: email,
        subject: "Đặt lại mật khẩu - Library System",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #333;">Đặt lại mật khẩu</h2>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>${email}</strong></p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">Mã OTP của bạn là:</p>
              <h1 style="margin: 10px 0; color: #007bff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="color: #666;">Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
            <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send forgot password email:", emailError);

      // Rollback OTP
      user.otpCode = undefined;
      user.otpExpires = undefined;
      user.otpPurpose = undefined;
      await user.save();

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Lỗi gửi email OTP. Vui lòng thử lại sau.",
      });
    }

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Mã OTP đã được gửi tới email. Vui lòng kiểm tra hộp thư.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { validate, excecute };