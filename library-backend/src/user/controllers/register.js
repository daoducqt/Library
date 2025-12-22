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
      { userName: input.userName }
    ];

    // Kiểm tra email trùng (nếu có)
    if (input.email) {
      checkDuplicate.push({ email: input.email });
    }

    // Kiểm tra phone trùng (nếu có)
    if (input.phone) {
      checkDuplicate.push({ phone: input.phone });
    }

    const existingUser = await User.findOne({ $or: checkDuplicate });

    if (existingUser) {
      // Tạo message cụ thể hơn
      let duplicateField = "";
      if (existingUser.userName === input.userName) {
        duplicateField = "Tên tài khoản";
      } else if (existingUser.email === input.email) {
        duplicateField = "Email";
      } else if (existingUser.phone === input.phone) {
        duplicateField = "Số điện thoại";
      }

      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: `${duplicateField} đã tồn tại`,
      });
    }

    // ─── HASH PASSWORD ───────────────────────────────────
    const hashedPassword = await bcrypt.hash(input.password, 10);
    input.password = hashedPassword;

    // Nếu đăng ký bằng EMAIL → Cần verify OTP
    if (input.email) {
      input.isVerified = false;

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      input.otpCode = otp;
      input.otpExpires = new Date(Date.now() + 2 * 60 * 1000);

      // ─── CREATE USER ─────────────────────────────────────
      const user = await User.create(input);

      // Gửi OTP qua email
      await sendMail({
        to: user.email,
        subject: "Mã OTP xác thực tài khoản",
        text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 2 phút.`,
      });

      return res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
        userId: user._id,
        requireVerification: true
      });
    } 
    // Nếu đăng ký bằng SĐT → Không cần verify, active luôn
    else {
      input.isVerified = true;

      // ─── CREATE USER
      const user = await User.create(input);

      return res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        message: "Đăng ký thành công. Bạn có thể đăng nhập ngay.",
        userId: user._id,
        requireVerification: false
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute, validate };