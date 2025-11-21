import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import User from "../models/User.js";
import { RoleTypeEnum } from "../models/User.js";
import bcrypt from "bcrypt";

const validate = Joi.object({
  phone: Joi.string().required().trim().messages({
    "string.base": "Số điện thoại phải là chuỗi",
    "any.required": "Số điện thoại là bắt buộc",
  }),
  password: Joi.string().required().trim().messages({
    "string.base": "Mật khẩu phải là chuỗi",
    "any.required": "Mật khẩu là bắt buộc",
  }),
  fullName: Joi.string().required().trim().messages({
    "string.base": "Tên đầy đủ phải là chuỗi",
    "any.required": "Tên đầy đủ là bắt buộc",
  }),
  role: Joi.string()
    .valid(...Object.values(RoleTypeEnum))
    .required()
    .messages({
      "string.base": "Chức vụ phải là một chuỗi",
      "any.only": "Chức vụ không hợp lệ",
      "any.required": "Chức vụ là bắt buộc",
    }),
});

const excecute = async (req, res) => {
  try {
    const input = req.body;

    const existingUser = await User.findOne({ phone: input.phone });
    if (existingUser) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Người dùng đã tồn tại",
      });
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    input.password = hashedPassword;

    const data = await User.create(input);

    if (!data) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
    }

    res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute, validate };