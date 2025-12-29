import mongoose from "mongoose";
import Review from "../model/review.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { limit = 10, page = 1, sortBy = "createdAt" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Book ID không hợp lệ",
      });
    }

    // Parse pagination
    const parsedLimit = Math.max(1, Math.min(50, parseInt(limit))); 
    const parsedPage = Math.max(1, parseInt(page));
    const skip = (parsedPage - 1) * parsedLimit;

    // Sort options
    const sortOptions = {
      createdAt: { createdAt: -1 },
      rating: { rating: -1, createdAt: -1 }, 
      oldest: { createdAt: 1 }, 
    };
    const sort = sortOptions[sortBy] || sortOptions.createdAt;

    const filter = { bookId };

    // Query với pagination
    const [total, reviews] = await Promise.all([
      Review.countDocuments(filter),
      Review.find(filter)
        .populate("userId", "userName fullName avatarId")
        .sort(sort)
        .skip(skip)
        .limit(parsedLimit),
    ]);

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: reviews,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
        hasNextPage: parsedPage * parsedLimit < total,
      },
    });

  } catch (err) {
    console.error("Get reviews error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };