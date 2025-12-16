import mongoose from "mongoose";
import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

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
                message: "Loan không ở trạng thái BORROWED",
            });
        }

        if (new Date() <= loan.dueDate) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Loan chưa quá hạn",
            });
        }

        loan.status = "OVERDUE";
        await loan.save();

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Đánh dấu quá hạn thành công",
            data: loan,
        });

    } catch (err) {
        console.error(err);
    }
};

export default { excecute };
