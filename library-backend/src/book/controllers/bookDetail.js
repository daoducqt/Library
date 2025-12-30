import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Book from "../models/Book.js";
import borrow from "../../loan/controller/borrow.js";

const excecute = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ObjectId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "ID không hợp lệ",
            });
        }

        const book = await Book.findById(id).populate("categoryId", "name slug viName");

        if (!book) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy sách",
            });
        }

        const bookData = book.toObject();
        
        // Thêm coverUrl
        bookData.coverUrl = book.coverId 
            ? `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg` 
            : null;
        
        // like count
        bookData.likeCount = book.likes ? book.likes.length : 0;

        const userId = req.user?._id;
        bookData.userLiked = userId && book.likes ? book.likes.some(id => id.equals(userId)) : false;

        if (userId) {
            const activeLoan = book.loans.findOne({
                userId,
                bookId: id,
                status: "BORROWED"  
            });

            bookData.userBorrowed = !!activeLoan;
            bookData.activeLoan = activeLoan ? {
                loanId: activeLoan._id,
                borrowDate: activeLoan.borrowDate,
                dueDate: activeLoan.dueDate,
                extendCount: activeLoan.extendCount
            } : null;
        } else {
            bookData.userBorrowed = false;
            bookData.activeLoan = null;
            }

        // Thêm link đọc online
        if (book.lendingIdentifier) {
            bookData.readOnlineUrl = `https://archive.org/details/${book.lendingIdentifier}`;
            bookData.canReadOnline = true;
        } else {
            bookData.readOnlineUrl = null;
            bookData.canReadOnline = false;
        }

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: bookData,
        });

    } catch (error) {
        console.error("Book detail error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };