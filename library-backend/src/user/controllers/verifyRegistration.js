import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import User from "../models/User.js";
import Registration from "../models/registration.js";

const validate = Joi.object({
    email: Joi.string().email().required().trim().messages({
    "string.base": "Email phải là chuỗi",
    "string.required": "Email là bắt buộc",
    }),
    otp: Joi.string().required().trim().messages({
    "string.base": "Mã OTP phải là chuỗi",
    "any.required": "Mã OTP là bắt buộc",
    }),
});

const excecute = async (req, res) => {
    try {
    const { email, otp } = req.body;

    const Registration = await Registration.findOne({ 
        email,
        otpCode: otp,
        otpExpiresAt: { $gt: new Date() } // check not expired
     });

     const existingUser = await User.findOne({
        $or: [
            { userName: Registration.userName },
            { email: Registration.email }
        ]
     });

     if (existingUser) {
        await Registration.deleteMany({ _id: Registration._id });
        return res.status(StatusCodes.BAD_REQUEST).send({
            status: StatusCodes.BAD_REQUEST,
            message: "Tài khoản đã tồn tại",
        });
     }

     const user = await User.create({
        fullName: Registration.fullName,
        userName: Registration.userName,
        email: Registration.email,
        phone: Registration.phone,
        password: Registration.password,
        role: Registration.role,
        isVerified: true,
     });

     await Registration.deleteOne({ _id: Registration._id });
        return res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        message: "Xác thực đăng ký thành công",
        userId: user._id,
    });
    } catch (error) {
    console.error("Lỗi xác thực đăng ký:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Lỗi máy chủ nội bộ",
    });
    }
};
export default { validate, excecute };