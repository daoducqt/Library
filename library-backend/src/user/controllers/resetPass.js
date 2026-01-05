import Joi from "joi";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const validate = Joi.object({
  email: Joi.string().email().required().trim().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  otp: Joi.string().length(6).required().messages({
    "string.length": "OTP phải có 6 chữ số",
    "any.required": "OTP là bắt buộc",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự",
    "any.required": "Mật khẩu mới là bắt buộc",
  }),
});

const excecute = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select("+otpCode +otpExpires +otpPurpose");
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Email không tồn tại",
      });
    }

    // Kiểm tra OTP
    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "OTP không đúng",
      });
    }

    // Kiểm tra OTP hết hạn
    if (new Date() > user.otpExpires) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "OTP đã hết hạn. Vui lòng yêu cầu lại.",
      });
    }

    // Kiểm tra otpPurpose
    if (user.otpPurpose !== "reset_password") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "OTP không hợp lệ cho mục đích này",
      });
    }

    // Hash password mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật password và xóa OTP
    user.password = hashedPassword;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    user.otpPurpose = undefined;
    await user.save();

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { validate, excecute };