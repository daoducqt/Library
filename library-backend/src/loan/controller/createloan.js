// d:\Library\library-backend\src\loan\controller\createTestLoan.js
import mongoose from "mongoose";
import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Loan from "../model/loan.js";
import User from "../../user/models/User.js";
import Book from "../../book/models/Book.js";

// Validation schema
const validate = Joi.object({
    userId: Joi.string().hex().length(24).required().messages({
        "string.base": "userId phải là chuỗi",
        "string.hex": "userId phải là ObjectId hợp lệ",
        "string.length": "userId phải có 24 ký tự",
        "any.required": "userId là bắt buộc",
    }),
    bookId: Joi.string().hex().length(24).required().messages({
        "string.base": "bookId phải là chuỗi",
        "string.hex": "bookId phải là ObjectId hợp lệ",
        "string.length": "bookId phải có 24 ký tự",
        "any.required": "bookId là bắt buộc",
    }),
    status: Joi.string().valid("BORROWED", "OVERDUE", "RETURNED").default("BORROWED").messages({
        "string.base": "status phải là chuỗi",
        "any.only": "status phải là: BORROWED, OVERDUE, hoặc RETURNED",
    }),
    daysLate: Joi.number().integer().min(1).when("status", {
        is: "OVERDUE",
        then: Joi.required(),
        otherwise: Joi.optional()
    }).messages({
        "number.base": "daysLate phải là số",
        "number.min": "daysLate phải >= 1",
        "any.required": "daysLate là bắt buộc khi status là OVERDUE",
    }),
});

const excecute = async (req, res) => {
    try {
        // Validate input
        const { error, value } = validate.validate(req.body, { abortEarly: false });
        
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Dữ liệu không hợp lệ",
                errors: errors,
            });
        }

        const { userId, bookId, status, daysLate } = value;

        // Kiểm tra user tồn tại
        const user = await User.findById(userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy user với userId này",
            });
        }

        // Kiểm tra book tồn tại
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy sách với bookId này",
            });
        }

        // Tính ngày mượn và ngày hạn
        const now = new Date();
        let borrowDate, dueDate;

        if (status === "OVERDUE" && daysLate) {
            // Nếu OVERDUE, tính ngược từ số ngày trễ
            dueDate = new Date(now.getTime() - daysLate * 24 * 60 * 60 * 1000);
            borrowDate = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Mượn 7 ngày
        } else if (status === "RETURNED") {
            // Nếu RETURNED, set borrowDate 14 ngày trước, dueDate 7 ngày trước
            borrowDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            dueDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else {
            // BORROWED: mượn hôm nay, hạn 7 ngày sau
            borrowDate = now;
            dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }

        // Tạo loan test
        const loan = await Loan.create({
            userId: userId,
            bookId: bookId,
            borrowDate: borrowDate,
            dueDate: dueDate,
            status: status,
            pickCode: `TEST${Date.now()}` // Pickcode giả
        });

        // Populate
        const populatedLoan = await Loan.findById(loan._id)
            .populate('userId', 'username email')
            .populate('bookId', 'title author coverUrl');

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Tạo loan test thành công",
            data: {
                loan: populatedLoan,
                summary: {
                    user: user.username,
                    book: book.title,
                    status: status,
                    borrowDate: borrowDate,
                    dueDate: dueDate,
                    daysLate: daysLate || 0
                }
            }
        });
    } catch (error) {
        console.error("createTestLoan error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ: " + error.message,
        });
    }
};

export default { validate, excecute };