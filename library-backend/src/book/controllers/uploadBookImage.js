import fs from "fs/promises";
import path from "path";
import Book from "../models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        message: "Vui lòng chọn file ảnh",
      });
    }

    // Lấy ảnh cũ để xoá (nếu có)
    const existingBook = await Book.findById(id).select("image");
    if (!existingBook) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        message: "Không tìm thấy sách",
      });
    }

    const oldImage = existingBook?.image;
    const imagePath = `/uploads/books/${req.file.filename}`;

    // Cập nhật DB
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { image: imagePath },
      { new: true }
    ).populate("categoryId", "name slug");

    // Xoá file cũ khỏi disk
    try {
      if (oldImage && oldImage.startsWith("/uploads/books/")) {
        const fileFullPath = path.join(process.cwd(), oldImage.replace(/^\//, ""));
        await fs.unlink(fileFullPath).catch(() => {});
      }
    } catch (e) {
      console.warn("Failed to remove old book image:", e?.message || e);
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Cập nhật ảnh sách thành công",
      data: updatedBook,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật ảnh sách:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };