import Joi from "joi";
import mongoose from "mongoose";
import Loan from "../model/loan.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Fine from "../../fine/model/fine.js";
import { createNotification, notifyAdminNewBorrow } from "../../notification/services/notification.service.js";
import { generatePickupCode } from "../service/loan.service.js";

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

    /* =====  validate bookId ===== */
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "ID sách không hợp lệ",
      });
    }

    /* =====  kiểm tra loan đang tồn tại ===== */
    const activeLoans = await Loan.find({
      userId: user._id,
      status: { $in: ["PENDING", "BORROWED", "OVERDUE"] },
    });

    const alreadyBorrowedThisBook = activeLoans.some(
      loan => loan.bookId.toString() === bookId
    );

    if (alreadyBorrowedThisBook) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Bạn đã mượn cuốn sách này rồi",
      });
    }

    // có sách quá hạn
    const hasOverdue = activeLoans.some(
      loan => loan.status === "OVERDUE"
    );

    if (hasOverdue) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Bạn đang có sách quá hạn, vui lòng trả sách trước khi mượn thêm",
      });
    }

    // vượt giới hạn mượn
    const borrowedCount = activeLoans.filter(
      loan => loan.status === "BORROWED"
    ).length;

    if (borrowedCount >= MAX_ACTIVE_BORROWS) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: `Bạn chỉ được mượn tối đa ${MAX_ACTIVE_BORROWS} sách cùng lúc`,
      });
    }

    /* =====  kiểm tra book ===== */
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

    /* =====  tạo loan ===== */
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate.getTime() + days * 86400000);

    const pickCode = await generatePickupCode();
    const pickupExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const loan = await Loan.create({
      userId: user._id,
      bookId,
      borrowDate,
      dueDate,
      status: "PENDING",
      pickCode,
      pickupExpiry,
    });

    /* =====  gửi thông báo ===== */
    try {
      // Thông báo cho user
      await createNotification(
        user._id,
        "Đặt sách thành công!",
        `Mã lấy sách: ${pickCode}. Vui lòng đến quầy thư viện trong 24 giờ để nhận sách "${book.title}".`,
        {
          type: "BORROW",
          loanId: loan._id,
          bookId: book._id,
          link: `/loans/${loan._id}`,
          metadata: { 
            pickCode, 
            pickupExpiry,
            bookTitle: book.title
          }
        }
      );

      // Thông báo cho admin
      await notifyAdminNewBorrow(user.fullName || user.email, book.title, loan._id);
    } catch (notiErr) {
      console.error("Error sending notification:", notiErr);
    }

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Đặt sách thành công",
      data: loan,
      pickCode,
      pickupExpiry,
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