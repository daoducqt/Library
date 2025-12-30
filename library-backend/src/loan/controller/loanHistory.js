import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const HISTORY_STATUS = ["RETURNED", "OVERDUE", "CANCELLED", "EXPIRED"];

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
        return res.status(StatusCodes.BAD_REQUEST).send({
          status: StatusCodes.BAD_REQUEST,
          message: "Status không hợp lệ. Chỉ chấp nhận: RETURNED, OVERDUE, CANCELLED, EXPIRED",
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
        .limit(parsedLimit)
        .lean(),
    ]);

    // Format data sạch sẽ cho FE
    const formattedLoans = loans.map(loan => ({
      loanId: loan._id,
      status: loan.status,
      borrowDate: loan.borrowDate,
      dueDate: loan.dueDate,
      returnDate: loan.returnDate,
      extendCount: loan.extendCount,
      book: {
        bookId: loan.bookId._id,
        title: loan.bookId.title,
        author: loan.bookId.author,
        isbn: loan.bookId.isbn,
        coverUrl: loan.bookId.coverId
          ? `https://covers.openlibrary.org/b/id/${loan.bookId.coverId}-L.jpg`
          : null,
      },
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt,
    }));

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: formattedLoans,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
        hasNextPage: parsedPage * parsedLimit < total,
        hasPrevPage: parsedPage > 1,
      },
    });

  } catch (error) {
    console.error("Loan history error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };