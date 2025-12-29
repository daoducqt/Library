// loanHistory.js
import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const HISTORY_STATUS = ["RETURNED", "OVERDUE", "CANCELLED"];

const excecute = async (req, res) => {
  try {
    const user = req.user;
    const { status, limit = 10, page = 1 } = req.query;

    // Parse pagination
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit)));
    const parsedPage = Math.max(1, parseInt(page));
    const skip = (parsedPage - 1) * parsedLimit;

    // Xây dựng filter
    let statusFilter = HISTORY_STATUS;

    // Nếu client truyền status cụ thể
    if (status) {
      const inputStatus = Array.isArray(status) ? status : status.split(",");
      statusFilter = inputStatus.filter(s => HISTORY_STATUS.includes(s.toUpperCase()));

      if (statusFilter.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: "Status không hợp lệ. Chỉ chấp nhận: RETURNED, OVERDUE, CANCELLED",
        });
      }
    }

    const filter = {
      userId: user._id,
      status: { $in: statusFilter },
    };

    // Query với pagination
    const [total, loans] = await Promise.all([
      Loan.countDocuments(filter),
      Loan.find(filter)
        .populate("bookId", "title author coverId isbn")
        .sort({ returnDate: -1, borrowDate: -1 })
        .skip(skip)
        .limit(parsedLimit),
    ]);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: loans,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
        hasNextPage: parsedPage * parsedLimit < total,
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