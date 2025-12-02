import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Book from "../models/Book.js";
import mongoose from "mongoose";

const validate = Joi.object({
  title: Joi.string().trim(),
  author: Joi.string().trim(),
  description: Joi.string().trim(),
  publishedYear: Joi.number().integer(),
  genre: Joi.string().trim().allow("", null),
  available: Joi.boolean(),
  subjects: Joi.array().items(Joi.string().trim()),
  coverId: Joi.number().integer().allow(null),
  categoryId: Joi.string().hex().length(24),
}).min(1); // ít nhất phải có 1 field để update

const excecute = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "ID không hợp lệ",
      });
    }

    const updateData = req.body;
    const updatedBook = await Book.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedBook) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Không tìm thấy sách",
      });
    }

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: updatedBook,
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