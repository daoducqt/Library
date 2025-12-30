import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const user = req.user;

        const loans = await Loan.find({
            userId: user._id,
            status: { $in: ["PENDING", "BORROWED"] },
        })
        .populate("bookId", "title author coverId")
        .sort({ createdAt: -1 })
        .lean();

        // Format data sạch sẽ cho FE
        const now = new Date();
        const formattedLoans = loans.map(loan => ({
            loanId: loan._id,
            status: loan.status,
            pickupCode: loan.pickCode,
            pickupExpiry: loan.pickupExpiry,
            borrowDate: loan.borrowDate,
            dueDate: loan.dueDate,
            extendCount: loan.extendCount,
            isExpired: loan.status === "PENDING" ? now > loan.pickupExpiry : false,
            book: {
                bookId: loan.bookId._id,
                title: loan.bookId.title,
                author: loan.bookId.author,
                coverUrl: loan.bookId.coverId
                    ? `https://covers.openlibrary.org/b/id/${loan.bookId.coverId}-L.jpg`
                    : null,
            },
            createdAt: loan.createdAt,
            updatedAt: loan.updatedAt,
        }));

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: formattedLoans,
        });

    } catch (error) {
        console.error("loanActive error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };