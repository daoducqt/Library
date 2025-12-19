import Stock from "../model/stockIn.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Book from "../../book/models/Book.js";
import { StockTypeEnum } from "../model/stockIn.js";
import Joi from "joi";

const validate = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
  note: Joi.string().allow("").optional(),
});

const execute = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, type, note } = req.body;
        const userId = req.user._id;

        const book = await Book.findById(id);
        if (!book) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy sách",
            });
        }

        // kiểm tra đủ số lượng để xuất kho
        if (book.availableCopies < quantity) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Số lượng xuất kho vượt quá số lượng sách hiện có",
            });
        }

        // cập nhật số lượng sách
        book.totalCopies -= quantity;
        book.availableCopies -= quantity;
        await book.save();

        // tạo bản ghi xuất kho
        const stockOutRecord = new Stock({
            bookId: book._id,
            quantity,
            type: StockTypeEnum.STOCK_OUT,
            note,
            createdBy: userId,
        });
        await stockOutRecord.save();
        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            message: ReasonPhrases.CREATED,
            data: stockOutRecord,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: error.message,
        });
    }
};
export default { validate, execute };