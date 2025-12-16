import Book from "../models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import mongoose from "mongoose";

const excecute = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "ID không hợp lệ",
            });
        }

        const book = await Book.findById(id);

        if (!book) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy sách",
            });
        }

        if (!book.categoryId) {
            return res.status(StatusCodes.OK).send({
                status: StatusCodes.OK,
                message: ReasonPhrases.OK,
                data: []
            });
        }

        const results = await Book.find({
            _id: { $ne: book._id }, // loại trừ sách hiện tại
            categoryId: book.categoryId,
        }).limit(10) // giới hạn 10 kết quả
        .populate("categoryId", "name slug");
        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: results,
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };