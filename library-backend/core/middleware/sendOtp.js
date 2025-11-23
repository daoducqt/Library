//sendOtp
import User from "../../src/user/models/User.js";
import sendMail from "../utils/sendMail.js";
import sendSms from "../utils/sendSms.js";
import StatusCodes from "../utils/statusCode/statusCode.js";
import ReasonPhrases from "../utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const { account, method } = req.body;

        const user = await User.findOne({
            $or: [
                { email: account },
                { phone: account }
            ]
    });

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Tài khoản không tồn tại",
            });
        }

        // Generate OTP code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otpCode = otp;
        user.otpExpires = new Date(Date.now() + 2 * 60 * 1000); // OTP expires in 2 minutes
        await user.save();

       if (method === "email" && user.email) {
        await sendMail(user.email, `Mã OTP của bạn là: ${otp}`);
    } else if (method === "sms" && user.phone) {
        await sendSms(user.phone, `Mã OTP của bạn là: ${otp}`);
    } else {
        return res.status(StatusCodes.BAD_REQUEST).send({
            status: StatusCodes.BAD_REQUEST,
            message: "Vui lòng chọn phương thức gửi OTP hợp lệ",
        });
    }


        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Mã OTP đã được gửi",
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };