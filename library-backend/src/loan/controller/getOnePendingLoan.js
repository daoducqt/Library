import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import mongoose from "mongoose";

const excecute = async (req, res) => {
    try {
        const { loanId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(loanId)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Loan ID không hợp lệ",
            });
        }
        
        // Tìm pending loan theo loanId
        const loan = await Loan.findOne({
            _id: loanId,
            status: "PENDING"
        })
        .populate("userId", "userName fullName email phone avatar")
        .populate("bookId", "title author coverId availableCopies")
        .lean();

        if (!loan) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy yêu cầu mượn sách hoặc đã được xác nhận",
            });
        }

        // Thêm thông tin bổ sung
        const now = new Date();
        const loanWithExtra = {
            ...loan,
            isExpired: now > loan.pickupExpiry,
            user: loan.userId,
            book: loan.bookId ? {
                ...loan.bookId,
                coverUrl: loan.bookId.coverId
                    ? `https://covers.openlibrary.org/b/id/${loan.bookId.coverId}-L.jpg`
                    : null
            } : null
        };

        // Xóa userId và bookId cũ (đã chuyển thành user và book)
        delete loanWithExtra.userId;
        delete loanWithExtra.bookId;

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: loanWithExtra,
        });
    } catch (error) {
        console.error("Get pending loan detail error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };