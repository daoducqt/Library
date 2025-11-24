import User from "../../src/user/models/User.js";
import StatusCodes from "../utils/statusCode/statusCode.js";
import ReasonPhrases from "../utils/statusCode/reasonPhares.js";
import sendMail from "../utils/sendMail.js";
const excecute = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Vui lòng nhập email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Tài khoản không tồn tại",
      });
    }

    // Tạo OTP mới, ghi đè OTP cũ
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 phút
    await user.save();

    // Gửi OTP qua email
    await sendMail(user.email, `Mã OTP mới của bạn là: ${otp}`);

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "OTP mới đã được gửi đến email của bạn",
    });

  } catch (error) {
    console.error("resendOtp error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };