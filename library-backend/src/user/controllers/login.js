import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../services/user.service.js";

const validate = Joi.object({
  account: Joi.string().required().trim().min(1).messages({
    "string.base": "Tên người dùng phải là chuỗi",
    "any.required": "Tên người dùng là bắt buộc",
  }),
  password: Joi.string().required().trim().min(1).messages({
    "string.base": "Mật khẩu phải là một chuỗi",
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

const excecute = async (req, res) => {
  try {
    const { account , password } = req.body;

    // Find user by userName
    const user = await User.findOne({ 
      $or: [ { userName: account }, { email: account }, { phone: account } ]
     });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: StatusCodes.UNAUTHORIZED,
        message: "Tên người dùng hoặc mật khẩu không chính xác",
      });
    }

    // ─── TẮT KIỂM TRA XÁC THỰC EMAIL ───────────────────────────────
    // /* ─── CODE CŨ - CHECK VERIFIED ───────────────────────────────
    // if (user.email && !user.isVerified) {
    //   return res.status(StatusCodes.FORBIDDEN).send({
    //     status: StatusCodes.FORBIDDEN,
    //     message: "Tài khoản chưa được xác thực, vui lòng kiểm tra email để xác thực tài khoản.",
    //     userId: user._id,
    //     requireVerification: true,
    //   });
    // }
    // */ ─── KẾT THÚC CODE CŨ ───────────────────────────────

    // Verify password
    if (!user.password) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Lỗi dữ liệu người dùng",
      });
    }

    // check status
    if (user.status === "BANNED") {
        return res.status(StatusCodes.FORBIDDEN).send({
          status: StatusCodes.FORBIDDEN,
          message: "Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên."
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: StatusCodes.UNAUTHORIZED,
        message: "Tên người dùng hoặc mật khẩu không chính xác",
      });
    }

    // Convert to plain object and remove sensitive fields
    const userData = user.toObject ? user.toObject() : { ...user._doc };
    delete userData.password;
    delete userData.refreshToken;

    // Generate tokens
    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    // Save refresh token to database
    await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true });

    // Optional: set refreshToken in httpOnly cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: false, // Cho phép JS đọc để dùng cho Socket.IO
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK || "Đăng nhập thành công",
      data: {
        user: userData,
        // accessToken, // Trả về token để frontend lưu vào localStorage
        // refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR || "Lỗi máy chủ",
    });
  }
};

export default {
  validate,
  excecute,
};