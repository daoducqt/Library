import Joi from "joi";
import User from "../models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import sendMail from "../../../core/utils/sendMail.js";

const validate = Joi.object({
  newEmail: Joi.string().email().required().trim().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email mới là bắt buộc",
  }),
});

const excecute = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newEmail } = req.body;

    // Kiểm tra email mới không trùng email hiện tại
    const currentUser = await User.findById(userId).select("email");
    if (currentUser.email === newEmail) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Email mới không được trùng email hiện tại",
      });
    }

    // Kiểm tra email mới chưa được dùng bởi user khác
    const existingEmail = await User.findOne({ email: newEmail });
    if (existingEmail) {
      return res.status(StatusCodes.CONFLICT).send({
        status: StatusCodes.CONFLICT,
        message: "Email này đã được sử dụng",
      });
    }

    // Tạo OTP (6 chữ số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // hết hạn trong 2 phút

    // Lưu OTP + email chờ xác nhận vào DB
    await User.findByIdAndUpdate(userId, {
      otpCode: otp,
      otpExpires,
      pendingEmail: newEmail,
      otpPurpose: "change_email",
    });

    // Gửi OTP qua email mới — nếu thất bại thì rollback các trường OTP/pendingEmail
try {
  if (!process.env.EMAIL_USER) {
    // optional: dev mode fallback -> log và mock
    console.warn("EMAIL_USER not configured; skipping real email send (mock mode). OTP:", otp);
  } else {
    await sendMail({
      to: newEmail,
      subject: "Xác nhận đổi email",
      html: `
        <h2>Xác nhận đổi email</h2>
        <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
        <p>Mã này có hiệu lực trong 2 phút.</p>
      `,
    });
  }
} catch (emailError) {
  console.error("Failed to send OTP email:", emailError);

  // rollback — xóa otp/pendingEmail đã lưu
  try {
    await User.findByIdAndUpdate(userId, {
      $unset: { otpCode: "", otpExpires: "", pendingEmail: "", otpPurpose: "" }
    });
  } catch (rollbackErr) {
    console.error("Failed to rollback OTP fields after sendMail error:", rollbackErr);
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "Lỗi gửi email OTP. Vui lòng thử lại sau.",
  });
}

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "OTP đã được gửi tới email mới. Vui lòng xác nhận trong 2 phút",
      data: { newEmail },
    });
  } catch (error) {
    console.error("requestChangeEmail error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { validate, excecute };