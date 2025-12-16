import mongoose from "mongoose";
import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";


const excecute = async (req, res) => {
    try {
        const { loanId } = req.params;
        const user = req.user;

        if (!mongoose.Types.ObjectId.isValid(loanId)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Loan ID không hợp lệ",
            });
        }

        const loan = await Loan.findById(loanId)
            .populate("userId", "fullName userName")
            .populate("bookId", "title author");

        if (!loan) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy loan",
            });
        }

        if (user.role === "USER" && loan.userId._id.toString() !== user._id) {
            return res.status(StatusCodes.FORBIDDEN).send({
                status: StatusCodes.FORBIDDEN,
                message: "Bạn không có quyền xem loan này",
            });
        }

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Thành công",
            data: loan,
        });
    } catch (err) {
        console.error("Loan detail error:", err);
    }
};

export default { excecute };
