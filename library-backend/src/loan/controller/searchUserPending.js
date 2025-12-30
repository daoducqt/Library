import Loan from "../model/loan.js";
import User from "../../user/models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const { query } = req.query; 

        if (!query) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Thiếu từ khóa tìm kiếm",
            });
        }

        // Tìm user
        const users = await User.find({
            $or: [
                { userName: { $regex: query, $options: "i" } },
                { fullName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
                { phone: { $regex: query, $options: "i" } },
            ]
        })
        .select("userName fullName email phone avatar")
        .limit(10)
        .lean();

        if (users.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy người dùng",
            });
        }

        // Lấy pending loans của các user tìm được
        const userIds = users.map(u => u._id);
        const loans = await Loan.find({
            userId: { $in: userIds },
            status: "PENDING"
        })
        .populate("bookId", "title author coverId")
        .sort({ createdAt: -1 })
        .lean();

        // Group loans by user
        const now = new Date();
        const result = users.map(user => ({
            ...user,
            pendingLoans: loans
                .filter(loan => loan.userId.toString() === user._id.toString())
                .map(loan => ({
                    ...loan,
                    isExpired: now > loan.pickupExpiry,
                    bookId: loan.bookId ? {
                        ...loan.bookId,
                        coverUrl: loan.bookId.coverId
                            ? `https://covers.openlibrary.org/b/id/${loan.bookId.coverId}-L.jpg`
                            : null
                    } : null
                }))
        }));

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: result,
        });
    } catch (error) {
        console.error("Search user pending error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };