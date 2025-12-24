import mongoose from "mongoose";
import Review from "../model/review.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const excecute = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Review ID không hợp lệ",
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Không tìm thấy review",
      });
    }

    if (review.userId.toString() !== user._id) {
      return res.status(StatusCodes.FORBIDDEN).send({
        status: StatusCodes.FORBIDDEN,
        message: "Không có quyền xoá review này",
      });
    }

    await review.deleteOne();

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
      avgRating: stats[0]?.avgRating || 0,
      reviewCount: stats[0]?.reviewCount || 0,
    });

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Xoá đánh giá thành công",
    });

  } catch (err) {
    console.error("Delete review error:", err);
  }
};

export default { excecute };
