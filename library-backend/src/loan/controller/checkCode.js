import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Joi from "joi";

const validate = Joi.object({
    pickupCode: Joi.string().required().pattern(/^\d{6}$/).message({
        "string.pattern.base": "Mã xác nhận phải gồm 6 chữ số",
        "any.required": "Mã xác nhận là bắt buộc",
    }),
});

const excecute = async (req, res) => {
    try {
        const { pickupCode } = req.body;

        if (!pickupCode) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Thiếu mã xác nhận",
            });
        }

        const loan = await Loan.findOne({
            pickCode: pickupCode,
            status: "PENDING",
        })
        .populate("userId", "userName email fullName phone avatar")
        .populate("bookId", "title author coverId availableCopies");

        if (!loan) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Mã không hợp lệ hoặc đã được xác nhận",
            });
        }

        // Check hết hạn
        const now = new Date();
        const isExpired = now > loan.pickupExpiry;

        if (isExpired) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Mã đã hết hạn (quá 24 giờ)",
                data: {
                    pickupExpiry: loan.pickupExpiry,
                }
            });
        }

        // Check sách còn không
        if (loan.bookId.availableCopies < 1) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Sách đã hết, không thể xác nhận",
            });
        }

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Thông tin yêu cầu mượn sách",
            data: {
                loan: {
                    _id: loan._id,
                    pickupCode: loan.pickupCode,
                    borrowDate: loan.borrowDate,
                    dueDate: loan.dueDate,
                    pickupExpiry: loan.pickupExpiry,
                    createdAt: loan.createdAt,
                },
                user: {
                    _id: loan.userId._id,
                    userName: loan.userId.userName,
                    fullName: loan.userId.fullName,
                    email: loan.userId.email,
                    phone: loan.userId.phone,
                    avatar: loan.userId.avatar,
                },
                book: {
                    _id: loan.bookId._id,
                    title: loan.bookId.title,
                    author: loan.bookId.author,
                    availableCopies: loan.bookId.availableCopies,
                    coverUrl: loan.bookId.coverId 
                        ? `https://covers.openlibrary.org/b/id/${loan.bookId.coverId}-L.jpg`
                        : null
                }
            },
        });
    } catch (error) {
        console.error("Check pickup code error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute, validate };