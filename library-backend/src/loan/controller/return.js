import mongoose from "mongoose";
import Loan from "../model/loan.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const { loanId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(loanId)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Loan ID không hợp lệ",
            });
        }

        const loan = await Loan.findById(loanId);
        if (!loan) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy loan",
            });
        }

        if (loan.status !== "BORROWED") {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Loan đã trả hoặc bị hủy",
            });
        }

        const now = new Date();
        const isOverdue = now > loan.dueDate;

        loan.returnDate = now;
        loan.status = isOverdue ? "OVERDUE" : "RETURNED";
        await loan.save();

        await Book.findByIdAndUpdate(loan.bookId, {
            $inc: { availableCopies: +1 }
        });

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Trả sách thành công",
            data: loan,
        });

    } catch (error) {
        console.error("Return error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };
