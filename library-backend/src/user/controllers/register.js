import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import User from "../models/User.js";
import { RoleTypeEnum } from "../models/User.js";
import bcrypt from "bcrypt";
import sendMail from "../../../core/utils/sendMail.js";
import Registration from "../models/registration.js";

const validate = Joi.object({
  fullName: Joi.string().required().trim().messages({
    "string.base": "Tên người dùng phải là chuỗi",
    "any.required": "Tên người dùng là bắt buộc",
  }),
  userName: Joi.string().required().trim().messages({
    "string.base": "Tên tài khoản dùng phải là chuỗi",
    "any.required": "Tên tài khoản là bắt buộc",
  }),

  email: Joi.string().email().required().trim().messages({
    "string.base": "Email phải là chuỗi",
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
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
      { email: input.email },
      ...(input.phone ? [{ phone: input.phone }] : []),
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

    // ─── GỬI OTP VỀ EMAIL ───────────────────────────────
    // Xóa registration cũ nếu có (cùng email hoặc userName)
    await Registration.deleteMany({
      $or: [{ email: input.email }, { userName: input.userName }]
    });

    // Tạo OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu vào bảng Registration tạm
    await Registration.create({
      fullName: input.fullName,
      userName: input.userName,
      email: input.email,
      phone: input.phone || null,
      password: hashedPassword, // Đã hash
      role: RoleTypeEnum.USER,
      otpCode: otp,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
    });

    // Gửi email OTP
    await sendMail({
      to: input.email,
      subject: "Mã OTP xác thực tài khoản",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Xác thực tài khoản</h2>
          <p>Xin chào <strong>${input.fullName}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Mã OTP của bạn là:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 5px;">
            <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="margin-top: 20px;">Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
          <p style="color: #666;">Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
        </div>
      `
    });

    console.log(`✅ OTP sent to ${input.email}: ${otp}`); // Log để test

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Vui lòng kiểm tra email để nhận mã OTP.",
      email: input.email,
      requireVerification: true
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message
    });
  }
};

export default { excecute, validate };