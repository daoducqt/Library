import Fine from "../model/fine.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const excecute = async (req, res) => {
    try {
        const fines = await Fine.find()
            .populate({
                path: "loanId",
                select: "bookId borrowDate dueDate returnDate status",
                populate: {
                    path: "bookId",
                    select: "title author coverId isbn"
                }
            })
            .populate("userId", "userName fullName email phone avatar")
            .sort({ createdAt: -1 });

        // Thêm coverUrl cho sách
        const finesWithBookInfo = fines.map(fine => {
            const fineObj = fine.toObject();
            if (fineObj.loanId?.bookId) {
                fineObj.loanId.bookId.coverUrl = fineObj.loanId.bookId.coverId
                    ? `https://covers.openlibrary.org/b/id/${fineObj.loanId.bookId.coverId}-L.jpg`
                    : null;
            }
            return fineObj;
        });

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Lấy danh sách phạt thành công",
            data: finesWithBookInfo,
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