import Category from "../model/category.js";
import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import mongoose from "mongoose";
import slugify from "slugify";

const validate = Joi.object({
  name: Joi.string().trim(),
  viName: Joi.string().allow("", null).trim(),
  isActive: Joi.boolean(),
  // Bỏ order - không cho sửa
});

const excecute = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "ID không hợp lệ",
      });
    }

    // Kiểm tra category có tồn tại không
    const category = await Category.findById(id);
    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Category không tồn tại",
      });
    }

    // Kiểm tra trùng name với category khác
    if (req.body.name && req.body.name !== category.name) {
      const existing = await Category.findOne({ 
        name: req.body.name, 
        _id: { $ne: id } 
      });
      if (existing) {
        return res.status(StatusCodes.CONFLICT).send({
          status: StatusCodes.CONFLICT,
          message: "Tên category đã tồn tại",
        });
      }

      // Tự động tạo slug mới khi đổi name
      req.body.slug = slugify(req.body.name, { 
        lower: true, 
        locale: "vi", 
        remove: /[*+~.()'"!:@]/g 
      });
    }

    // Xóa order khỏi req.body nếu có (không cho update order)
    delete req.body.order;

    // Update category
    const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Cập nhật category thành công",
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