import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import User from "../models/User.js";
import Registration from "../models/registration.js";

const validate = Joi.object({
  email: Joi.string().email().required().trim().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  otp: Joi.string().required().trim().messages({
    "any.required": "Mã OTP là bắt buộc",
  }),
});

const excecute = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // ─── TÌM REGISTRATION TEMP ───────────────────────────────
    const registration = await Registration.findOne({ 
      email,
      otpCode: otp,
      otpExpires: { $gt: new Date() } // OTP chưa hết hạn
    });

    if (!registration) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "OTP không hợp lệ hoặc đã hết hạn. Vui lòng đăng ký lại.",
      });
    }

    // ─── CHECK DUPLICATE LẦN CUỐI (đề phòng race condition) ───────────────
    const existingUser = await User.findOne({
      $or: [
        { userName: registration.userName },
        { email: registration.email }
      ]
    });

    if (existingUser) {
      // Xóa registration
      await Registration.deleteOne({ _id: registration._id });
      
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Tài khoản hoặc email đã tồn tại.",
      });
    }

    // ─── TẠO USER CHÍNH THỨC ───────────────────────────────
    const user = await User.create({
      fullName: registration.fullName,
      userName: registration.userName,
      email: registration.email,
      phone: registration.phone,
      password: registration.password,
      role: registration.role,
      isVerified: true
    });

    // ─── XÓA REGISTRATION TEMP ───────────────────────────────
    await Registration.deleteOne({ _id: registration._id });

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Xác thực thành công! Bạn có thể đăng nhập ngay.",
      userId: user._id
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