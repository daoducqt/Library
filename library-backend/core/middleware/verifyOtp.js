//verifyOtp
import User from "../../src/user/models/User.js";
import StatusCodes from "../utils/statusCode/statusCode.js";
import ReasonPhrases from "../utils/statusCode/reasonPhares.js";
import { generateAccessToken } from "../../src/user/services/user.service.js";

export const verifyOtp = async (req, res) => {
  try {
    const { account, otp, type } = req.body;

    if (!account || !otp) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Vui lòng nhập tài khoản và mã OTP",
      });
    }

    const user = await User.findOne({
      $or: [{ email: account }, { phone: account }],
    }).select("+otpCode +otpExpires");

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Tài khoản không tồn tại",
      });
    }

    // OTP không tồn tại
    if (!user.otpCode || !user.otpExpires) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "OTP không tồn tại. Vui lòng yêu cầu mã mới.",
      });
    }

    // OTP hết hạn
    if (user.otpExpires < new Date()) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "OTP đã hết hạn. Vui lòng yêu cầu mã mới.",
      });
    }

    // OTP sai
    if (user.otpCode !== otp) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "OTP không đúng",
      });
    }

    // Xóa OTP sau khi validate thành công
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Nếu type = "login" → trả accessToken
    if (type === "login") {
      const token = generateAccessToken(user);
      return res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        message: "Xác thực OTP thành công (Đăng nhập)",
        accessToken: token,
      });
    }

    // Nếu type = "verify" → không trả token
    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Xác thực OTP thành công",
    });

  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};
