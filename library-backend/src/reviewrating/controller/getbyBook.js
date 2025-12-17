import mongoose from "mongoose";
import Review from "../model/review.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const excecute = async (req, res) => {
  try {
    const { id: bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Book ID không hợp lệ",
      });
    }

    const reviews = await Review.find({ bookId })
      .populate("userId", "userName fullName")
      .sort({ createdAt: -1 });

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "OK",
      data: reviews,
    });

  } catch (err) {
    console.error("Get reviews error:", err);
  }
};

export default { excecute };
