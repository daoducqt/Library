// src/adminDashboard/controller/recentActivities.js
import Loan from "../../loan/model/loan.js";
import Fine from "../../fine/model/fine.js";
import User from "../../user/models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    // Recent loans (borrowed)
    const recentLoans = await Loan.find({ status: "BORROWED" })
      .sort({ borrowDate: -1 })
      .limit(limitNum)
      .populate("userId", "fullName userName avatar email")
      .populate("bookId", "title author image coverId")
      .select("userId bookId borrowDate dueDate status");

    // Recent returns
    const recentReturns = await Loan.find({ status: "RETURNED" })
      .sort({ returnDate: -1 })
      .limit(limitNum)
      .populate("userId", "fullName userName avatar email")
      .populate("bookId", "title author image coverId")
      .select("userId bookId returnDate borrowDate status");

    // Recent fines (paid)
    const recentFines = await Fine.find({ isPayed: true })
      .sort({ paidAt: -1 })
      .limit(limitNum)
      .populate("userId", "fullName userName avatar email")
      .select("userId loanId amount daysLate paidAt");

    // Populate bookId in fines
    const finesWithBooks = await Promise.all(
      recentFines.map(async (fine) => {
        const loan = await Loan.findById(fine.loanId).populate("bookId", "title author");
        return {
          ...fine.toObject(),
          book: loan?.bookId || null,
        };
      })
    );

    // New users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsers = await User.find({
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .select("fullName userName email avatar createdAt role");

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: {
        recentLoans,
        recentReturns,
        recentFines: finesWithBooks,
        newUsers,
      },
    });
  } catch (error) {
    console.error("recentActivities error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };