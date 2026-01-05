import Joi from "joi";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const validate = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Mật khẩu hiện tại là bắt buộc",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "Mật khẩu mới phải có ít nhất 6 ký tự",
    "any.required": "Mật khẩu mới là bắt buộc",
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    "any.only": "Xác nhận mật khẩu không khớp",
    "any.required": "Xác nhận mật khẩu là bắt buộc",
  }),
});

const excecute = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    // Lấy thông tin user (có password)
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Không tìm thấy người dùng",
      });
    }

    // Kiểm tra password hiện tại
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    // Kiểm tra password mới không trùng password cũ
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
      });
    }

    // Hash password mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật password
    user.password = hashedPassword;
    await user.save();

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("changePassword error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { validate, excecute };