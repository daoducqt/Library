import Category from "../model/category.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const isActive = req.query.isActive;

    if (page < 1 || limit < 1) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Page và limit phải > 0",
      });
    }

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (page - 1) * limit;
    const total = await Category.countDocuments(query);

    const data = await Category.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ order: 1, createdAt: -1 });

    const totalPages = Math.ceil(total / limit);

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data,
      pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    });
  } catch (error) {
    console.error("Get All Categories Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };