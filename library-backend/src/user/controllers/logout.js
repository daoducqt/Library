import User from "../models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const userId = req.user._id; // assume middleware đã decode token và attach user

    // Xóa refresh token
    await User.findByIdAndUpdate(userId, { refreshToken: "" });

    // Xóa cookie nếu có
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("Lỗi khi logout:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };