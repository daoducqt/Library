import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const excecute = async (req, res) => {
    try {
        const total = await Loan.countDocuments();
        const borrowed = await Loan.countDocuments({ status: "BORROWED" });
        const overdue = await Loan.countDocuments({ status: "OVERDUE" });

        const topUsers = await Loan.aggregate([
            { $group: { _id: "$userId", totalLoans: { $sum: 1 } } },
            { $sort: { totalLoans: -1 } },
            { $limit: 5 },
            { $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }},
            { $unwind: "$user" }
        ]);

        const topBooks = await Loan.aggregate([
            { $group: { _id: "$bookId", totalLoans: { $sum: 1 } } },
            { $sort: { totalLoans: -1 } },
            { $limit: 5 },
            { $lookup: {
                from: "books",
                localField: "_id",
                foreignField: "_id",
                as: "book"
            }},
            { $unwind: "$book" }
        ]);

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "OK",
            data: {
                total,
                borrowed,
                overdue,
                topUsers,
                topBooks,
            }
        });

    } catch (err) {
        console.error(err);
    }
};

export default { excecute };
