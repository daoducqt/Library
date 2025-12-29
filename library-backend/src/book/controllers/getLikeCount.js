import Book from "../models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?._id; 

    const book = await Book.findById(bookId).select("likes");
    
    if (!book) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Sách không tồn tại",
      });
    }

    const likeCount = book.likes.length;
    const userLiked = userId ? book.likes.includes(userId) : false;

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: {
        bookId,
        likeCount,
        userLiked,
      },
    });
  } catch (error) {
    console.error("getLikeCount error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };