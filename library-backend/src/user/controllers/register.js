import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import User from "../models/User.js";
import { RoleTypeEnum } from "../models/User.js";
import bcrypt from "bcrypt";

const validate = Joi.object({
  userName: Joi.string().required().trim().messages({
    "string.base": "Tên người dùng phải là chuỗi",
    "any.required": "Tên người dùng là bắt buộc",
  }),
  email: Joi.string().email().required().trim().messages({
    "string.base": "Email phải là chuỗi",
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  phone: Joi.string().optional().trim().messages({
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
    input.role = RoleTypeEnum.USER; // dùng đăng kí mặc định là user

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
