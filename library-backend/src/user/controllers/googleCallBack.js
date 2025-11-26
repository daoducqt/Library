import User from "../models/User.js";
import { getGoogleTokens } from "../services/googleAuth.service.js";
import { generateAccessToken, generateRefreshToken } from "../services/user.service.js";
import { RoleTypeEnum } from "../models/User.js";

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

    if (!user) {
      // Auto register nếu chưa có
      user = await User.create({
        userName: email.split("@")[0],
        email,
        avatar: picture,
        isVerified: true,
        role: RoleTypeEnum.USER,
        password: "", // Google login không cần mật khẩu
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

    // return res.status(200).send({
    //   status: 200,
    //   message: "Google login thành công",
    //   data: { user: userData, accessToken, refreshToken },
    // });

    // Set HttpOnly Cookies
res.cookie("accessToken", accessToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});

// Redirect về frontend sau đăng nhập
return res.redirect(process.env.FRONTEND_URL + "/");
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).send({ message: "Google login failed" });
  }
};

export default { excecute };
