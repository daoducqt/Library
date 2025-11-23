import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../services/user.service.js";
import dotenv from "dotenv";
dotenv.config();

/* VALIDATION */
const validate = Joi.object({
  account: Joi.string().required().trim().messages({
    "string.base": "Tài khoản phải là chuỗi",
    "any.required": "Tài khoản là bắt buộc",
  }),
  password: Joi.string().required().trim().messages({
    "string.base": "Mật khẩu phải là một chuỗi",
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

/* LOGIN FUNCTION */
const excecute = async (req, res) => {
  try {
    const { account, password } = req.body;

    // Tìm theo phone hoặc userName hoặc email
    const user = await User.findOne({
      $or: [{ phone: account }, { userName: account }, { email: account }]
    });

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: StatusCodes.UNAUTHORIZED,
        message: `Tài khoản không tồn tại`,
      });
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: StatusCodes.UNAUTHORIZED,
        message: "Mật khẩu không chính xác",
      });
    }

    // Xoá mật khẩu ra khỏi dữ liệu trả về
    const userData = user.toObject();
    delete userData.password;

    // Generate Tokens
    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    // Lưu refresh token vào DB
    await User.findByIdAndUpdate(user._id, { refreshToken });

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: {
        user: userData,
        accessToken,
        refreshToken,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default {
  validate,
  excecute,
};
