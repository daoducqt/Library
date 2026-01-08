import Category from "../model/category.js";
import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const validate = Joi.object({
  name: Joi.string().required().trim().messages({
    "string.base": "Tên danh mục phải là chuỗi",
    "any.required": "Tên danh mục là bắt buộc",
    }),
    // description: Joi.string().allow(null, "").trim().messages({
    // "string.base": "Mô tả danh mục phải là chuỗi",
    // }),
    isActive: Joi.boolean(),
    viName: Joi.string().allow(null, "").trim().messages({
    "string.base": "Tên tiếng việt phải là chuỗi",
    }),
});

const excecute = async (req, res) => {
    try {
        const existing = await Category.findOne({ name: req.body.name });
        if (existing) {
            return res.status(StatusCodes.CONFLICT).send({
            status: StatusCodes.CONFLICT,
            message: "Category đã tồn tại",
        });
    }

        const maxOrderCategory = await Category.findOne().sort({ order: -1 }).select('order');
        req.body.order = maxOrderCategory ? maxOrderCategory.order + 1 : 1;

        const category = await Category.create(req.body);
        return res.status(StatusCodes.CREATED).send({
            status: StatusCodes.CREATED,
            message: ReasonPhrases.CREATED,
            data: category,
        });
    } catch (error) {
        console.error("Create Category error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { validate, excecute };