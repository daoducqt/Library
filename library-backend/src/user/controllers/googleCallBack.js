import User from "../models/User.js";
import { getGoogleTokens } from "../services/googleAuth.service.js";
import { generateAccessToken, generateRefreshToken } from "../services/user.service.js";
import { RoleTypeEnum } from "../models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const excecute = async (req, res) => {
  try {
    const code = req.query.code;

    const { id_token } = await getGoogleTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    // Decode Google ID Token
    const userInfo = JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());
    const { email, name, picture } = userInfo;

    // Kiểm tra user đã tồn tại chưa
    let user = await User.findOne({ email });

    // Nếu user tồn tại nhưng bị banned
    if (user && user.status === "BANNED") {
      return res.status(StatusCodes.FORBIDDEN).send({
        status: StatusCodes.FORBIDDEN,
        message: "Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên.",
      });
    }

    if (!user) {
      // Auto register nếu chưa có
      user = await User.create({
        userName: email.split("@")[0],
        email,
        avatar: picture,
        fullName: name,
        isVerified: true,
        role: RoleTypeEnum.USER,
        password: "", // Google login không cần mật khẩu
        status: "ACTIVE",
      });
    }

    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    // Tạo token hệ thống
    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    // Lưu refresh token vào DB
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })

    return res.redirect(process.env.FRONTEND_URL + "/");
    
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).send({ message: "Google login failed" });
  }
};

export default { excecute };
