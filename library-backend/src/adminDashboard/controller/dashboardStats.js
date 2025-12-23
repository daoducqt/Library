// src/adminDashboard/controller/dashboardStats.js
import User from "../../user/models/User.js";
import Book from "../../book/models/Book.js";
import Loan from "../../loan/model/loan.js";
import Fine from "../../fine/model/fine.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const execute = async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries
    const [
      totalUsers,
      totalBooks,
      activeLoans,
      loansThisMonth,
      unpaidFinesData,
      lastMonthUsers,
      lastMonthLoans,
    ] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Loan.countDocuments({ status: "BORROWED" }),
      Loan.countDocuments({ borrowDate: { $gte: thisMonthStart } }),
      Fine.aggregate([
        { $match: { isPayed: false } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      User.countDocuments({ createdAt: { $gte: lastMonth, $lt: thisMonthStart } }),
      Loan.countDocuments({ borrowDate: { $gte: lastMonth, $lt: thisMonthStart } }),
    ]);

    const unpaidFines = unpaidFinesData[0]?.total || 0;

    // Calculate growth
    const prevMonthUsers = totalUsers - lastMonthUsers;
    const userGrowth = prevMonthUsers > 0 
      ? ((lastMonthUsers / prevMonthUsers) * 100).toFixed(1) 
      : 0;

    const prevMonthLoans = loansThisMonth > lastMonthLoans 
      ? loansThisMonth - lastMonthLoans 
      : 0;
    const loanGrowth = lastMonthLoans > 0 
      ? ((prevMonthLoans / lastMonthLoans) * 100).toFixed(1) 
      : 0;

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: {
        totalBooks,
        totalUsers,
        activeLoans,
        loansThisMonth,
        unpaidFines,
        growth: {
          users: `+${userGrowth}%`,
          loans: `+${loanGrowth}%`,
        }
      }
    });
  } catch (error) {
    console.error("dashboardStats error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { execute };