import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const ALLOWED_STATUS = ["RETURNED", "OVERDUE", "CANCELLED"];

const excecute = async (req, res) => {
  try {
    const user = req.user;
    let { status, limit = 10, page = 1 } = req.query;

    // Parse pagination
    const parsedLimit = Math.max(1, parseInt(limit));
    const parsedPage = Math.max(1, parseInt(page));
    const skip = (parsedPage - 1) * parsedLimit;

    // mặc định là toàn bộ lịch sử
    let statusFilter = ALLOWED_STATUS;

    // nếu client truyền status
    if (status) {
      const inputStatus = Array.isArray(status)
        ? status
        : status.split(",");

      // chỉ nhận status hợp lệ
      statusFilter = inputStatus.filter(s =>
        ALLOWED_STATUS.includes(s)
      );

      if (!statusFilter.length) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: "Status không hợp lệ",
        });
      }
    }

    const filter = {
      userId: user._id,
      status: { $in: statusFilter },
    };

    // ✅ Thêm phân trang
    const [total, loans] = await Promise.all([
      Loan.countDocuments(filter),
      Loan.find(filter)
        .sort({ returnDate: -1, borrowDate: -1 })
        .populate("bookId", "title author coverId")
        .skip(skip)
        .limit(parsedLimit),
    ]);

    const hasNextPage = parsedPage * parsedLimit < total;

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: loans,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        hasNextPage,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    console.error("Loan history error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };