import Joi from "joi";
import mongoose from "mongoose";
import Review from "../model/review.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const validate = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().max(1000).allow(""),
});

const excecute = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Review ID không hợp lệ",
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Không tìm thấy review",
      });
    }

    if (review.userId.toString() !== user._id) {
      return res.status(StatusCodes.FORBIDDEN).send({
        status: StatusCodes.FORBIDDEN,
        message: "Không có quyền sửa review này",
      });
    }

    Object.assign(review, req.body, { isEdited: true });
    await review.save();

    /*  update lại rating book */
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

    await Book.findByIdAndUpdate(review.bookId, {
      avgRating: stats[0].avgRating,
    });

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Cập nhật đánh giá thành công",
      data: review,
    });

  } catch (err) {
    console.error("Update review error:", err);
  }
};

export default { validate, excecute };
