import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import User from "../models/User.js";
import { RoleTypeEnum } from "../models/User.js";
import bcrypt from "bcrypt";

const validate = Joi.object({
  userName: Joi.string().required().trim().messages({
    "string.base": "Tên tài khoản phải là chuỗi",
    "any.required": "Tên tài khoản là bắt buộc",
  }),
  password: Joi.string().required().trim().messages({
    "string.base": "Mật khẩu phải là chuỗi",
    "any.required": "Mật khẩu là bắt buộc",
  }),
  fullName: Joi.string().required().trim().messages({
    "string.base": "Tên đầy đủ phải là chuỗi",
    "any.required": "Tên đầy đủ là bắt buộc",
  }),
  email: Joi.string().email().allow(null, "").trim().messages({
    "string.base": "Email phải là chuỗi",
    "string.email": "Email không hợp lệ",
  }),
  phone: Joi.string().allow(null, "").trim().messages({
    "string.base": "Số điện thoại phải là chuỗi",
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

    // Check duplicate userName, email, phone
    const checkDuplicate = [
      { userName: input.userName },
      ...(input.email ? [{ email: input.email }] : []),
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
        message: `${duplicateField} đã được sử dụng`,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);
    input.password = hashedPassword;

    // Create user
    const data = await User.create(input);

    if (!data) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
    }

    res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Tạo người dùng thành công",
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