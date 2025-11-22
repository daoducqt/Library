import jwt from "jsonwebtoken";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import User from "../models/User.js";
import { generateAccessToken } from "../services/user.service.js";
import dotenv from "dotenv";
import Joi from "joi";
dotenv.config();

const validate = Joi.object({
  refreshToken: Joi.string().required().trim().messages({
    "string.base": "RefreshToken phải là một chuỗi",
    "any.required": "RefreshToken là bắt buộc",
  }),
});

const excecute = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  const userData = await User.findOne({ refreshToken: refreshToken });
  if (!refreshToken || !userData) {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      status: StatusCodes.UNAUTHORIZED,
      message: ReasonPhrases.UNAUTHORIZED,
    });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      });
    }

    // Remove `exp` from the decoded token (user object)
    const { exp, iat, ...newUserPayload } = user;

    // Create a new access token
    const accessToken = generateAccessToken(newUserPayload);

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: {
        accessToken,
      },
    });
  });
};

export default {
  validate,
  excecute,
};
