import Joi from "joi";
import User from "../../user/models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const validate = Joi.object({
  otp: Joi.string().required().trim().messages({
    "any.required": "OTP là bắt buộc",
  }),
});

const excecute = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otp } = req.body;

    // Tìm user
    const user = await User.findById(userId).select("+otpCode +otpExpires +pendingEmail");
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Người dùng không tồn tại",
      });
    }

    // Kiểm tra có pending email không
    if (!user.pendingEmail) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Không có yêu cầu đổi email",
      });
    }

    // Kiểm tra OTP hợp lệ
    if (user.otpCode !== otp) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: StatusCodes.UNAUTHORIZED,
        message: "OTP không chính xác",
      });
    }

    // Kiểm tra OTP chưa hết hạn
    if (new Date() > user.otpExpires) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        status: StatusCodes.UNAUTHORIZED,
        message: "OTP đã hết hạn",
      });
    }

    // ✅ Update email + xoá OTP
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        email: user.pendingEmail,
        pendingEmail: null,
        otpCode: null,
        otpExpires: null,
        otpPurpose: null,
      },
      { new: true }
    ).select("-password -refreshToken -otpCode -otpExpires");

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Email đã được đổi thành công",
      data: updatedUser,
    });
  } catch (error) {
    console.error("verifyChangeEmail error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { validate, excecute };
