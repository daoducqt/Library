import User, { RoleTypeEnum } from "../models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Joi from "joi";

const validate = Joi.object({
  role: Joi.string().valid(...Object.values(RoleTypeEnum)).optional().messages({
    "any.only": "Role không hợp lệ",
  }),
  status: Joi.string().valid("ACTIVE", "BANNED").optional().messages({
    "any.only": "Status không hợp lệ",
  }),
});

const excecute = async (req, res) => {
  try {
    const { id } = req.params;
    const input = req.body;

    // Validate input
    const { error } = validate.validate(input);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    }

    // Không cho update nếu input trống
    if (!input.role && !input.status) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Phải cung cấp role hoặc status để cập nhật",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      input,
      { new: true }
    ).select("-password -refreshToken -otpCode -otpExpires");

    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Người dùng không tồn tại",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Cập nhật user thành công",
      data: updatedUser,
    });

  } catch (error) {
    console.error("Lỗi khi admin cập nhật user:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute, validate };