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
      ...(input.email ? [{email: input.email}] : []),
      ...(input.phone ? [{phone: input.phone}] : []),
    ];

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

    
    // Nếu đăng ký bằng EMAIL → lưu tạm
    if (input.email) {
      await Registration.deleteMany({
        $or: [{ email: input.email }, { userName: input.userName }]
      })

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // luu đăng ký tạm thời
      await Registration.create({
        fullName: input.fullName,
        userName: input.userName,
        email: input.email,
        phone: input.phone || null,
        password: hashedPassword,
        otpCode: otp,
        otpExpires: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
        role: RoleTypeEnum.USER,
      });

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
      const user = await User.create({
        fullName: input.fullName,
        userName: input.userName,
        phone: input.phone,
        password: hashedPassword,
        role: RoleTypeEnum.USER,
        isVerified: true,
      });

      return res.status(StatusCodes.CREATED).send({
        status: StatusCodes.CREATED,
        message: "Đăng ký thành công.",
        data: {
          userId: user._id,
          requireVerification: false
        }
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