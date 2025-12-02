import Book from "../models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const { keyword, genres, publishedYear, available, page = 1, limit = 20 } = req.query;

    const query = {};

    // Keyword tìm trong title hoặc author
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { author: { $regex: keyword, $options: "i" } },
      ];
    }

    // Filter thể loại (genres)
    if (genres) {
      // genres có thể là chuỗi 'action,romance' hoặc mảng
      const genresArray = Array.isArray(genres) ? genres : genres.split(",").map(g => g.trim());
      query.genre = { $in: genresArray };
    }

    // Filter năm xuất bản (có thể đơn giản hoặc nâng cao)
    if (publishedYear) {
      // Nếu muốn hỗ trợ range, bạn có thể parse chuỗi để build query phù hợp
      query.publishedYear = Number(publishedYear); // ví dụ lấy năm cụ thể
    }

    // Filter trạng thái available
    if (available !== undefined) {
      query.available = available === "true"; // query param là chuỗi
    }

    // Tính toán phân trang
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    // Đếm tổng
    const total = await Book.countDocuments(query);

    // Lấy dữ liệu với populate category, sắp xếp mới nhất
    const data = await Book.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .populate("categoryId", "name slug");

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };
