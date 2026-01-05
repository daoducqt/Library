import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = "borrowDate" } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;

        // Chỉ lấy BORROWED (không bao gồm OVERDUE)
        const query = { status: "BORROWED" };

        const total = await Loan.countDocuments(query);

        const loans = await Loan.find(query)
            .populate("userId", "userName fullName email phone avatar")
            .populate("bookId", "title author coverId isbn category")
            .populate("comfirmedby", "userName fullName") // ✅ Sửa từ confirmedBy → comfirmedby
            .sort({ [sortBy]: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const now = new Date();
        const loansWithExtra = loans.map(loan => {
            const daysRemaining = Math.ceil((new Date(loan.dueDate) - now) / (1000 * 60 * 60 * 24));
            const borrowDuration = Math.ceil((now - new Date(loan.borrowDate)) / (1000 * 60 * 60 * 24));

            return {
                ...loan,
                daysRemaining: Math.max(0, daysRemaining),
                borrowDuration,
                confirmedBy: loan.comfirmedby, // ✅ Map lại cho response đẹp hơn
                comfirmedAt: loan.comfirmedAt,
                bookId: loan.bookId ? {
                    ...loan.bookId,
                    coverUrl: loan.bookId.coverId
                        ? `https://covers.openlibrary.org/b/id/${loan.bookId.coverId}-L.jpg`
                        : null
                } : null
            };
        });

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: loansWithExtra,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasNextPage: pageNum * limitNum < total,
                hasPrevPage: pageNum > 1,
            },
        });
    } catch (error) {
        console.error("Get borrowed loans error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };