import fs from "fs/promises";
import path from "path";
import User from "../models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Vui lòng chọn file ảnh",
      });
    }

    // Lấy avatar cũ để xoá (nếu có và không phải default)
    const existingUser = await User.findById(userId).select("avatar");
    const oldAvatar = existingUser?.avatar;

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Cập nhật DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true }
    ).select("-password -refreshToken -otpCode -otpExpires");

    // Xoá file cũ khỏi disk (nếu lưu ở public/uploads/avatars)
    try {
      if (
        oldAvatar &&
        oldAvatar.startsWith("/uploads/avatars/") &&
        !oldAvatar.includes("default") // tránh xóa avatar mặc định nếu có
      ) {
        const publicDir = process.env.PUBLIC_DIR || "public";
        const fileRelative = oldAvatar.replace(/^\//, ""); // remove leading slash
        const fileFullPath = path.join(process.cwd(), publicDir, fileRelative);
        await fs.unlink(fileFullPath).catch(() => {});
      }
    } catch (e) {
      // không block flow nếu xoá thất bại, log để debug
      console.warn("Failed to remove old avatar:", e?.message || e);
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Cập nhật avatar thành công",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật avatar:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };