import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const { loanId } = req.params;
        const userId = req.user;

        const loan = await Loan.findOne({ _id: loanId, userId: userId._id, status: "PENDING" });

        if (!loan) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy yêu cầu mượn sách",
            });
        }

        loan.status = "CANCELLED";
        await loan.save();

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Hủy yêu cầu mượn sách thành công",
        });
    } catch (error) {
        console.error("Cancel borrow error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};
export default { excecute };