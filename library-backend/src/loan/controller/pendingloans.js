import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = "createdAt" } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;

        // Query pending loans
        const query = { status: "PENDING" };

        const total = await Loan.countDocuments(query);

        const loans = await Loan.find(query)
            .populate("userId", "userName fullName email phone avatar")
            .populate("bookId", "title author coverId availableCopies")
            .sort({ [sortBy]: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        // Thêm coverUrl và check expired
        const now = new Date();
        const loansWithExtra = loans.map(loan => ({
            ...loan,
            isExpired: now > loan.pickupExpiry,
            bookId: loan.bookId ? {
                ...loan.bookId,
                coverUrl: loan.bookId.coverId
                    ? `https://covers.openlibrary.org/b/id/${loan.bookId.coverId}-L.jpg`
                    : null
            } : null
        }));

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
        console.error("Get pending loans error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };