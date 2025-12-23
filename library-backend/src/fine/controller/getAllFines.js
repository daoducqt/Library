import Fine from "../model/fine.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const excecute = async (req, res) => {
    try {
        const fines = await Fine.find()
        .populate("loanId", "bookId borrowDate dueDate returnDate")
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "lấy danh sách phạt thành công",
            data: fines,
        });

    } catch (error) {
        console.error("getAllFines error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ, vui lòng thử lại sau",
        });
    }
};

export default { excecute };