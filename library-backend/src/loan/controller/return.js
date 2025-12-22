import { notifyReturn } from "../../notification/services/notification.service.js";
import mongoose from "mongoose";
import Loan from "../model/loan.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Fine from "../../fine/model/fine.js";
import { FINE_PER_DAY } from "../../fine/contants/fine.contants.js";

const excecute = async (req, res) => {
    try {
        const { loanId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(loanId)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Loan ID không hợp lệ",
            });
        }

        const loan = await Loan.findById(loanId).populate("bookId");
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
        loan.status = "RETURNED";
        await loan.save();

        let daysLate = 0;
        /* ===== TẠO FINE NẾU QUÁ HẠN ===== */
        if (isOverdue) {
            const diffTime = now.getTime() - loan.dueDate.getTime();
            daysLate = Math.ceil(diffTime / 864e5); // 1 ngày = 86400000 ms

            await Fine.create({
                userId: loan.userId,
                loanId: loan._id,
                daysLate,
                amount: daysLate * FINE_PER_DAY,
            });
        }

        // Trả lại sách 
        await Book.findByIdAndUpdate(loan.bookId, {
            $inc: { availableCopies: +1 }
        });

        // Gửi thông báo trả sách
        try {
            await notifyReturn(loan.userId, loan.bookId.title, loan._id, daysLate);
        } catch (notiErr) {
            console.error("Error sending notification:", notiErr);
        }

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