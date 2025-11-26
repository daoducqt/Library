// middlewares/uploadAvatar.js
import multer from "multer";
import path from "path";

// Folder lưu avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars/");
  },
  filename: function (req, file, cb) {
    // Tạo tên file: timestamp + tên gốc
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + ext;
    cb(null, fileName);
  },
});

// Chỉ cho phép file hình ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ được upload file hình ảnh"), false);
  }
};

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export default uploadAvatar;
