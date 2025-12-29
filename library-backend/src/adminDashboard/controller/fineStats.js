// src/adminDashboard/controller/fineStats.js
import Fine from "../../fine/model/fine.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalFines,
      unpaidFines,
      paidFines,
      thisMonthFines,
      totalAmount,
      unpaidAmount,
      paidAmount,
    ] = await Promise.all([
      Fine.countDocuments(),
      Fine.countDocuments({ isPayed: false }),
      Fine.countDocuments({ isPayed: true }),
      Fine.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Fine.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Fine.aggregate([
        { $match: { isPayed: false } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Fine.aggregate([
        { $match: { isPayed: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
    ]);

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: {
        totalFines,
        unpaidFines,
        paidFines,
        thisMonthFines,
        totalAmount: totalAmount[0]?.total || 0,
        unpaidAmount: unpaidAmount[0]?.total || 0,
        paidAmount: paidAmount[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("fineStats error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };