import Book from "../models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id; 

    if (!bookId) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "bookId là bắt buộc",
      });
    }

    // Tìm book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Sách không tồn tại",
      });
    }

    // Kiểm tra user đã like chưa
    const userIndex = book.likes.indexOf(userId);
    const isLiked = userIndex !== -1;

    if (isLiked) {
      // Bỏ like
      book.likes.splice(userIndex, 1);
      await book.save();

      return res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        message: "Đã bỏ thích sách",
        data: {
          liked: false,
          likeCount: book.likes.length,
        },
      });
    } else {
      // Thêm like
      book.likes.push(userId);
      await book.save();

      return res.status(StatusCodes.OK).send({
        status: StatusCodes.OK,
        message: "Đã thích sách",
        data: {
          liked: true,
          likeCount: book.likes.length,
        },
      });
    }
  } catch (error) {
    console.error("toggleLike error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };