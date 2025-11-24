import Book from "../models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

let redisClient = null;
if (process.env.REDIS_URL) {
  import("ioredis")
    .then(({ default: IORedis }) => {
      redisClient = new IORedis(process.env.REDIS_URL);
    })
    .catch(() => {
      redisClient = null;
    });
}

const excecute = async (req, res) => {
  try {
    const bookId = req.params.id;
    if (!bookId) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Missing book id",
      });
    }

    // viewer id: prefer authenticated user, fallback to IP
    const viewerId = req.user?.id || req.ip || req.headers["x-forwarded-for"] || "anon";
    const dedupeKey = `book:view:${bookId}:${viewerId}`;

    if (redisClient) {
      // only increment if not seen in window (e.g., 1 hour)
      const added = await redisClient.set(dedupeKey, "1", "NX", "EX", 60 * 60);
      if (!added) {
        const book = await Book.findById(bookId).select("views");
        return res.status(StatusCodes.OK).send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: { views: book?.views ?? 0, incremented: false },
        });
      }
    } else {
      // no redis: could set cookie in FE or accept every call
    }

    const updated = await Book.findByIdAndUpdate(
      bookId,
      { $inc: { views: 1 } },
      { new: true, select: "views" }
    );

    if (!updated) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Book not found",
      });
    }

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: { views: updated.views, incremented: true },
    });
  } catch (error) {
    console.error("bookView error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };