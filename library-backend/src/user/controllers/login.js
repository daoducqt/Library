
import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../services/user.service.js";
import dotenv from "dotenv";
dotenv.config();

const validate = Joi.object({
  userName: Joi.string().required().trim().messages({
    "string.base": "Tên người dùng phải là chuỗi",
    "any.required": "Tên người dùng là bắt buộc",
  }),
  password: Joi.string().required().trim().messages({
    "string.base": "Mật khẩu phải là một chuỗi",
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

const excecute = async (req, res) => {
  try {
    const { phone, password } = req.body;

    let user = await User.findOne({ phone: phone });

    if (!user) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Không tồn tại tài khoản này`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: StatusCodes.UNAUTHORIZED,
        message: "Mật khẩu không chính xác",
      });
    }

    delete user.password;
    const userData = JSON.parse(JSON.stringify(user));
    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    // Save refresh token in database
    await User.findByIdAndUpdate({ _id: user._id }, { refreshToken: refreshToken });

    res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: {
        user: userData,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default {
  validate,
  excecute,
};
