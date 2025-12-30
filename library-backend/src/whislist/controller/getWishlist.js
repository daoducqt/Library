import Wishlist from "../models/Wishlist.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import { mongo } from "mongoose";

const excecute = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = "PENDING" } = req.query;

    if(!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "User ID không hợp lệ",
      });
    }
    
    const query = { userId };
    if (status) {
      query.status = status;
    }

    const wishlist = await Wishlist.find(query)
      .populate({
        path: "bookId",
        populate: {
          path: "categoryId",
          select: "name slug"
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Thêm coverUrl
    const wishlistWithCover = wishlist.map((item) => ({
      ...item,
      bookId: item.bookId ? {
        ...item.bookId,
        coverUrl: item.bookId.coverId
          ? `https://covers.openlibrary.org/b/id/${item.bookId.coverId}-L.jpg`
          : item.bookId.image || null,
        likeCount: item.bookId.likes ? item.bookId.likes.length : 0,
      } : null,
    }));

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: wishlistWithCover,
    });
  } catch (error) {
    console.error("getMyWishlist error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };