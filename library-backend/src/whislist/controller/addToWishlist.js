import Wishlist from "../model/whislist.model.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Book from "../../book/models/Book.js";

const excecute = async (req, res) => {
    try {
        const { bookId, note } = req.body;
        const userId = req.user._id;

        if (!bookId) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Thiếu bookId",
            });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy sách",
            });
        }

        if (book.availableCopies > 0) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Sách vẫn còn bản để mượn, không thể thêm vào wishlist",
            });
        }

        const existing = await Wishlist.findOne({ userId, bookId, status: "PENDING" });

        if (existing) {
            return res.status(StatusCodes.BAD_GATEWAY).send({
                status: StatusCodes.BAD_GATEWAY,
                message: "Sách đã có trong wishlist của bạn",
            });
        }

        const wishlist = await Wishlist.create({ userId, bookId, note });

        return res.status(StatusCodes.CREATED).send({
            status: StatusCodes.CREATED,
            message: ReasonPhrases.CREATED,
            data: wishlist,
        });
    } catch (error) {
        console.error("Add to wishlist error:", error);

        if (error.code === "11000") {
            return res.status(StatusCodes.BAD_GATEWAY).send({
                status: StatusCodes.BAD_GATEWAY,
                message: "Sách đã có trong wishlist của bạn",
            });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };