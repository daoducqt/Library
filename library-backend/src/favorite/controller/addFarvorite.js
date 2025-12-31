import Favorite from "../model/favorite.model.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const addFavorite = {
    excecute: async (req, res) => {
        try {
            const { bookId } = req.params;
            const userId = req.user._id;

            const book = await Book.findById(bookId);
            if (!book) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    status: StatusCodes.NOT_FOUND,
                    message: "Không tìm thấy sách",
                });
            }

            const existingFavorite = await Favorite.findOne({ userId, bookId });
            if (existingFavorite) {
                return res.status(StatusCodes.CONFLICT).json({
                    status: StatusCodes.CONFLICT,
                    message: "Sách đã có trong danh sách yêu thích",
                });
            }

            const favorite = await Favorite.create({ userId, bookId });

            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED,
                message: "Thêm sách vào yêu thích thành công",
                data: favorite,
            });
        } catch (error) {
            console.error("Error in addFavorite:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            });
        }
    },
};

export default addFavorite;