import Joi from "joi";
import mongoose from "mongoose";
import Loan from "../model/loan.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Fine from "../../fine/model/fine.js";


const MAX_ACTIVE_BORROWS = 10;
const MAX_BORROW_DAYS = 60;
const DEFAULT_BORROW_DAYS = 14;

const validate = Joi.object({
  bookId: Joi.string().required().hex().length(24),
  days: Joi.number().integer().min(1).max(MAX_BORROW_DAYS).default(DEFAULT_BORROW_DAYS),
});

const excecute = async (req, res) => {
  try {
    const { bookId, days } = req.body;
    const user = req.user;
    // chặn user mượn sách nếu còn nợ phạt
    const unpaidFines = await Fine.exists({
      userId: user._id,
      isPaid: false,
    });

    if (unpaidFines) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Bạn còn nợ phạt, vui lòng thanh toán trước khi mượn sách",
      });
    }

    /* ===== 1️⃣ validate bookId ===== */
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "ID sách không hợp lệ",
      });
    }

    /* ===== 2️⃣ kiểm tra loan đang tồn tại ===== */
    const activeLoans = await Loan.find({
      userId: user._id,
      status: { $in: ["BORROWED", "OVERDUE"] },
    });

    // ❌ có sách quá hạn
    const hasOverdue = activeLoans.some(
      loan => loan.status === "OVERDUE"
    );

    if (hasOverdue) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Bạn đang có sách quá hạn, vui lòng trả sách trước khi mượn thêm",
      });
    }

    // ❌ vượt giới hạn mượn
    const borrowedCount = activeLoans.filter(
      loan => loan.status === "BORROWED"
    ).length;

    if (borrowedCount >= MAX_ACTIVE_BORROWS) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: `Bạn chỉ được mượn tối đa ${MAX_ACTIVE_BORROWS} sách cùng lúc`,
      });
    }

    /* ===== 3️⃣ kiểm tra book ===== */
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Không tìm thấy sách",
      });
    }

    if (book.availableCopies < 1) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Sách hiện không còn bản nào để mượn",
      });
    }

    /* ===== 4️⃣ tạo loan ===== */
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate.getTime() + days * 86400000);

    const loan = await Loan.create({
      userId: user._id,
      bookId,
      borrowDate,
      dueDate,
      status: "BORROWED",
    });

    /* ===== 5️⃣ update số lượng sách ===== */
    await Book.findByIdAndUpdate(bookId, {
      $inc: { availableCopies: -1 },
    });

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Mượn sách thành công",
      data: loan,
    });

  } catch (error) {
    console.error("Borrow error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { validate, excecute };