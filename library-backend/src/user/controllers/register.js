import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import User from "../models/User.js";
import { RoleTypeEnum } from "../models/User.js";
import bcrypt from "bcrypt";
import sendMail from "../../../core/utils/sendMail.js";

const validate = Joi.object({
  fullName: Joi.string().required().trim().messages({
    "string.base": "Tên người dùng phải là chuỗi",
    "any.required": "Tên người dùng là bắt buộc",
  }),
  userName: Joi.string().required().trim().messages({
    "string.base": "Tên tài khoản dùng phải là chuỗi",
    "any.required": "Tên tài khoản là bắt buộc",
  }),

  email: Joi.string().email().allow(null, "").trim().messages({
    "string.base": "Email phải là chuỗi",
    "string.email": "Email không hợp lệ",
  }),

  phone: Joi.string().allow(null, "").optional().trim().messages({
    "string.base": "Số điện thoại phải là chuỗi",
  }),

  password: Joi.string().required().trim().messages({
    "string.base": "Mật khẩu phải là chuỗi",
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

const excecute = async (req, res) => {  
  try {
    const input = req.body;
    input.role = RoleTypeEnum.USER;

    // ─── CHECK DUPLICATE ───────────────────────────────
    const checkDuplicate = [
      { userName: input.userName },
      { email: input.email }
    ];

    // Chỉ push nếu phone có giá trị thật
    if (input.phone) {
      checkDuplicate.push({ phone: input.phone });
    }

    const existingUser = await User.findOne({ $or: checkDuplicate });

    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Tên người dùng, email hoặc số điện thoại đã tồn tại",
      });
    }

    // ─── HASH PASSWORD ───────────────────────────────────
    const hashedPassword = await bcrypt.hash(input.password, 10);
    input.password = hashedPassword;

    // Tạo User chưa verifu
    input.isVerified = false;

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    input.otpCode = otp;
    input.otpExpires = new Date(Date.now() + 2 * 60 * 1000);

    // ─── CREATE USER ─────────────────────────────────────
    const user = await User.create(input);

    // Gửi otp
    if (user.email) await sendMail({
      to: user.email,
      subject: "Mã OTP xác thực tài khoản",
      text: `Mã OTP của bạn là: ${otp}`,
    });

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      userId: user._id,
    });

  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute, validate };
