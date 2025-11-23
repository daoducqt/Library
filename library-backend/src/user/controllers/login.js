import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../services/user.service.js";

const validate = Joi.object({
  userName: Joi.string().required().trim().min(1).messages({
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
    const { userName, password } = req.body;

    // Find user by userName
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: StatusCodes.UNAUTHORIZED,
        message: "Tên người dùng hoặc mật khẩu không chính xác",
      });
    }

    // Verify password
    if (!user.password) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Lỗi dữ liệu người dùng",
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
        accessToken,
        // refreshToken optional — nếu lưu cookie thì không cần gửi body
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