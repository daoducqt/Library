import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Book from "../../models/Book.js";

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

        const data = await Book.findById(id);

        if (!data) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy sách",
            });
        }

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: data,
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