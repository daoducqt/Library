import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Book from "../models/Book.js";

const validate = Joi.object({
    title: Joi.string().required().trim().messages({
        "string.base": "Tiêu đề phải là chuỗi",
        "any.required": "Tiêu đề là bắt buộc",
    }),
    author: Joi.string().required().trim().messages({
        "string.base": "Tác giả phải là chuỗi",
        "any.required": "Tác giả là bắt buộc",
    }),
    description: Joi.string().required().trim().messages({
        "string.base": "Mô tả phải là chuỗi",
        "any.required": "Mô tả là bắt buộc",
    }),
    publishedYear: Joi.number().integer().required().messages({
        "number.base": "Năm xuất bản phải là số",
        "any.required": "Năm xuất bản là bắt buộc",
    }),
    genre: Joi.string().allow("", null),
    available: Joi.boolean(),
});

const excecute = async (req, res) => {
    try {
        const input = req.body;
        const data = await Book.create(input);

        if (!data) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: ReasonPhrases.INTERNAL_SERVER_ERROR,
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

export default { validate, excecute };