import Fine from "../model/fine.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const excecute = async (req, res) => {
    try {
        const user = req.user._id;

        const fines = await Fine.find({ userId: user })
            .populate("loanId", "bookId borrowDate dueDate returnDate")
            .sort({ createdAt: -1 });

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "lấy danh sách phạt thành công",
            data: fines,
        });

    } catch (error) {
        console.error("getMyFines error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ, vui lòng thử lại sau",
        });
    }
};

export default { excecute };