import User from "../models/User.js";
import { getGoogleTokens } from "../services/googleAuth.service.js";
import { generateAccessToken, generateRefreshToken } from "../services/user.service.js";
import { RoleTypeEnum } from "../models/User.js";
import crypto from "crypto";


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

    if (user && user.status === "BANNED") {
      return res.status(403).send({
        status: 403,
        message: "Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên.",
      });
    }
    if (!email) {
      return res.status(400).send({ message: "Google account chưa có email" });
    }

    if (!user) {
      let baseUserName = email.split("@")[0];
      let newUserName = baseUserName;
      let counter = 1;

      // tránh trùng userName
    while (await User.findOne({ userName: newUserName })) {
      newUserName = `${baseUserName}${counter}`;
      counter++;
    }
      // Auto register nếu chưa có
      user = await User.create({
        userName: newUserName,
        email,
        fullName: name,
        avatar: picture,
        isVerified: true,
        role: RoleTypeEnum.USER,
        password:  crypto.randomBytes(20).toString("hex"), // tạo password ngẫu nhiên
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

    // Set HttpOnly Cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
    });

    // redirect về FE
    return res.redirect(process.env.PRONTEND_URL + "/");

  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).send({ message: "Google login failed" });
  }
};

export default { excecute };
