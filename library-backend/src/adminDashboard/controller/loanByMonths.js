// src/adminDashboard/controller/loanTrendsByMonth.js
import Loan from "../../loan/model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const execute = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const sixMonthsAgo = new Date(currentYear, now.getMonth() - 5, 1);

    const loansByMonth = await Loan.aggregate([
      {
        $match: {
          borrowDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$borrowDate" },
            month: { $month: "$borrowDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Generate labels (T1, T2, ..., T6)
    const labels = [];
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      labels.push(`T${month}`);
      
      const found = loansByMonth.find(
        (item) => item._id.month === month && item._id.year === year
      );
      data.push(found ? found.count : 0);
    }

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: {
        labels,
        data,
      },
    });
  } catch (error) {
    console.error("loanTrendsByMonth error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { execute };