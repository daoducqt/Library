import Wishlist from "../model/whislist.model.js"; 
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import mongoose from "mongoose"; 

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
        select: "title author coverId image availableCopies", 
        populate: {
          path: "categoryId",
          select: "name slug"
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    const wishlistFormatted = wishlist.map((item) => ({
      _id: item._id,
      status: item.status,
      note: item.note,
      createdAt: item.createdAt,
      notifiedAt: item.notifiedAt,
      book: item.bookId ? {
        _id: item.bookId._id,
        title: item.bookId.title,
        author: item.bookId.author,
        coverUrl: item.bookId.coverId
          ? `https://covers.openlibrary.org/b/id/${item.bookId.coverId}-L.jpg`
          : item.bookId.image || null,
        availableCopies: item.bookId.availableCopies,
        category: item.bookId.categoryId ? {
          name: item.bookId.categoryId.name,
          slug: item.bookId.categoryId.slug
        } : null
      } : null,
    }));

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: wishlistFormatted,
    });
  } catch (error) {
    console.error("getWishlist error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };