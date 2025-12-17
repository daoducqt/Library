import Joi from "joi";
import mongoose from "mongoose";
import Review from "../model/review.js";
import Loan from "../../loan/model/loan.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const validate = Joi.object({
  bookId: Joi.string().hex().length(24).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(1000).allow(""),
});

const excecute = async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Book ID không hợp lệ",
      });
    }

    /*  chỉ cho review khi đã từng mượn và trả */
    const hasBorrowed = await Loan.exists({
      userId: user._id,
      bookId,
      status: "RETURNED",
    });

    if (!hasBorrowed) {
      return res.status(StatusCodes.FORBIDDEN).send({
        status: StatusCodes.FORBIDDEN,
        message: "Bạn chỉ có thể đánh giá sách đã mượn và trả",
      });
    }

    const review = await Review.create({
      userId: user._id,
      bookId,
      rating,
      comment,
    });

    /*  update rating trong Book */
    const stats = await Review.aggregate([
      { $match: { bookId: review.bookId } },
      {
        $group: {
          _id: "$bookId",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    await Book.findByIdAndUpdate(bookId, {
      avgRating: stats[0].avgRating,
      reviewCount: stats[0].reviewCount,
    });

    return res.status(StatusCodes.CREATED).send({
      status: StatusCodes.CREATED,
      message: "Đánh giá thành công",
      data: review,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Bạn đã đánh giá sách này rồi",
      });
    }

    console.error("Create review error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Lỗi máy chủ",
    });
  }
};

export default { validate, excecute };
