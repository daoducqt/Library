import Category from "../model/category.js";
import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const validate = Joi.object({
  name: Joi.string().trim(),
//   description: Joi.string().allow("", null),
  icon: Joi.string().allow("", null),
  isActive: Joi.boolean(),
  order: Joi.number().integer().min(0).messages({
    "number.base": "Thứ tự phải là số",
    "number.min": "Thứ tự phải >= 0",
  }),
});

const excecute = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Category not found",
      });
    }

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: updated,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { validate, excecute };