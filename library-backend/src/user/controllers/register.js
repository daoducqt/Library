import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import User from "../models/User.js";
import { RoleTypeEnum } from "../models/User.js";
import bcrypt from "bcrypt";
// import sendMail from "../../../core/utils/sendMail.js";
// import Registration from "../models/registration.js";

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

    // ─── CHECK DUPLICATE ───────────────────────────────
    const checkDuplicate = [
      { userName: input.userName },
      ...(input.email ? [{email: input.email}] : []),
      ...(input.phone ? [{phone: input.phone}] : []),
    ];

    const existingUser = await User.findOne({ $or: checkDuplicate });

    if (existingUser) {
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

    // ─── TẮT TÍNH NĂNG XÁC THỰC OTP - TẠO USER TRỰC TIẾP ───────────────────────────────
    // /* ─── CODE CŨ - GỬI OTP ───────────────────────────────
    // if (input.email) {
    //   await Registration.deleteMany({
    //     $or: [{ email: input.email }, { userName: input.userName }]
    //   });

    //   const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //   await Registration.create({
    //     fullName: input.fullName,
    //     userName: input.userName,
    //     email: input.email,
    //     phone: input.phone || null,
    //     password: hashedPassword,
    //     role: RoleTypeEnum.USER,
    //     otpCode: otp,
    //     otpExpires: new Date(Date.now() + 5 * 60 * 1000),
    //   });

    //   await sendMail({
    //     to: input.email,
    //     subject: "Mã OTP xác thực tài khoản",
    //     text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
    //   });

    //   return res.status(StatusCodes.OK).send({
    //     status: StatusCodes.OK,
    //     message: "Vui lòng kiểm tra email để nhận mã OTP.",
    //     email: input.email,
    //     requireVerification: true
    //   });
    // }
    // */ ─── KẾT THÚC CODE CŨ ───────────────────────────────

    // ─── TẠO USER TRỰC TIẾP - KHÔNG CẦN XÁC THỰC ───────────────────────────────
    const user = await User.create({
      fullName: input.fullName,
      userName: input.userName,
      email: input.email || null,
      phone: input.phone || null,
      password: hashedPassword,
      role: RoleTypeEnum.USER,
      isVerified: true, // ← Tự động verify
    });

    return res.status(StatusCodes.CREATED).send({
      status: StatusCodes.CREATED,
      message: "Đăng ký thành công. Bạn có thể đăng nhập ngay.",
      data: {
        userId: user._id,
        requireVerification: false
      }
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