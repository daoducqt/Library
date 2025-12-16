import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const ALLOWED_STATUS = ["RETURNED", "OVERDUE", "CANCELLED"];

const excecute = async (req, res) => {
  try {
    const user = req.user;
    let { status } = req.query;

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

    const loans = await Loan.find({
      userId: user._id,
      status: { $in: statusFilter },
    })
      .sort({ returnDate: -1, borrowDate: -1 })
      .populate("bookId", "title author coverId");

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Thành công",
      data: loans,
    });
  } catch (err) {
    console.error("loanHistory error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Lỗi máy chủ",
    });
  }
};

export default { excecute };