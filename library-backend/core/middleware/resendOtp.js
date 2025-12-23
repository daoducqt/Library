import User from "../../src/user/models/User.js";
import Registration from "../../src/user/models/registration.js";
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

    // ─── TÌM TRONG REGISTRATION TEMP (cho đăng ký)
    let registration = await Registration.findOne({ email });

    if (registration) {
      // Tạo OTP mới
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      registration.otpCode = otp;
      registration.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
      registration.createdAt = new Date(); // Reset TTL
      await registration.save();

      // Gửi OTP qua email
      await sendMail({
        to: email,
        subject: "Mã OTP xác thực tài khoản",
        text: `Mã OTP mới của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
      });

      return res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        message: "OTP mới đã được gửi đến email của bạn (đăng ký)",
      });
    }

    // ─── TÌM TRONG USER (cho đổi email hoặc các mục đích khác)
    const user = await User.findOne({ 
      $or: [
        { email }, 
        { pendingEmail: email } // Trường hợp đang đổi sang email mới
      ] 
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Không tìm thấy tài khoản hoặc yêu cầu đăng ký.",
      });
    }

    // Tạo OTP mới cho user
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 phút
    await user.save();

    // Gửi OTP đến email phù hợp
    const targetEmail = user.pendingEmail || user.email;
    await sendMail({
      to: targetEmail,
      subject: "Mã OTP xác thực",
      text: `Mã OTP mới của bạn là: ${otp}. Mã có hiệu lực trong 2 phút.`,
    });

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