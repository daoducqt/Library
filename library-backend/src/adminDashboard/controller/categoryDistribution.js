import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const execute = async (req, res) => {
  try {
    const categoriesWithCount = await Book.aggregate([
      {
        $group: {
          _id: "$categoryId",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          categoryName: { 
            $ifNull: ["$category.viName", "$category.name", "Chưa phân loại"] 
          },
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Calculate total for percentage
    const total = categoriesWithCount.reduce((sum, item) => sum + item.count, 0);

    const result = categoriesWithCount.map((item) => ({
      category: item.categoryName,
      count: item.count,
      percentage: total > 0 ? parseFloat(((item.count / total) * 100).toFixed(1)) : 0,
    }));

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: result,
    });
  } catch (error) {
    console.error("categoryDistribution error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { execute };