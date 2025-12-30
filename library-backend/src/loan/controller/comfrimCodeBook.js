
import Loan from "../model/loan.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const { loanId } = req.params; 
        const admin = req.user;

        if (!loanId) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Thiếu loanId",
            });
        }

        const loan = await Loan.findOne({
            _id: loanId,
            status: "PENDING",
        })
        .populate("userId", "userName email fullName")
        .populate("bookId", "title author availableCopies");

        if (!loan) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy yêu cầu hoặc đã được xác nhận",
            });
        }

        // Double check hết hạn
        if (new Date() > loan.pickupExpiry) {
            loan.status = "EXPIRED";
            await loan.save();

            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Mã đã hết hạn",
            });
        }

        // Double check sách còn không
        if (loan.bookId.availableCopies < 1) {
            loan.status = "CANCELLED";
            await loan.save();

            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Sách không còn bản để mượn",
            });
        }

        // Xác nhận
        loan.status = "BORROWED";
        loan.confirmedAt = new Date(); // Sửa typo
        loan.confirmedBy = admin._id;  // Sửa typo
        await loan.save();

        // Trừ sách
        await Book.findByIdAndUpdate(loan.bookId._id, {
            $inc: { availableCopies: -1 },
        });

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Xác nhận mượn sách thành công",
            data: {
                loan: {
                    _id: loan._id,
                    pickupCode: loan.pickupCode,
                    status: loan.status,
                    confirmedAt: loan.confirmedAt,
                    dueDate: loan.dueDate,
                },
                user: loan.userId,
                book: loan.bookId,
            },
        });
    } catch (error) {
        console.error("Confirm code error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };