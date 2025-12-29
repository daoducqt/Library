import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const { period = "month", limit = 10 } = req.query;

        const now = new Date();
        let startDate;

        switch (period) {
            case "week":
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case "month":
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                break;
            case "year":
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case "all":
                startDate = new Date(0);
                break;
            default:
                return res.status(StatusCodes.BAD_REQUEST).send({
                    status: StatusCodes.BAD_REQUEST,
                    message: "Invalid period. Use 'week', 'month', 'year', or 'all'.",
                });
        }

        // Aggregate 
        const topBooks = await Loan.aggregate([
            {
                $match: {
                    borrowDate: { $gte: startDate }, 
                    status: { $in: ["BORROWED", "RETURNED", "OVERDUE"] },
                },
            },
            {
                $group: {
                    _id: "$bookId", 
                    borrowCount: { $sum: 1 },
                    lastBorrowDate: { $max: "$borrowDate" }, 
                },
            },
            {
                $sort: { borrowCount: -1 },
            },
            {
                $limit: parseInt(limit, 10),
            },
            {
                $lookup: {
                    from: "books",
                    localField: "_id",
                    foreignField: "_id",
                    as: "bookDetails",
                },
            },
            {
                $unwind: "$bookDetails",
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "bookDetails.categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true, // Để sách không có category vẫn hiển thị
                },
            },
            {
                $project: {
                    _id: 0,
                    bookId: "$bookDetails._id",
                    title: "$bookDetails.title",
                    borrowCount: 1,
                    lastBorrowDate: 1, 
                    bookDetails: {
                        _id: "$bookDetails._id",
                        title: "$bookDetails.title",
                        author: "$bookDetails.author",
                        description: "$bookDetails.description",
                        publishedYear: "$bookDetails.publishedYear",
                        totalCopies: "$bookDetails.totalCopies",
                        availableCopies: "$bookDetails.availableCopies", 
                        views: "$bookDetails.views",
                        image: "$bookDetails.image",
                        coverId: "$bookDetails.coverId",
                        coverURL: {
                            $cond: {
                                if: { $ne : ["$bookDetails.coverId", null] },
                                then: {
                                    $concat: ["https://covers.openlibrary.org/b/id/", { $toString: "$bookDetails.coverId" }, "-L.jpg"],
                                },
                                else: "$bookDetails.image",
                            }
                        }
                    },
                    category: {
                        _id: "$category._id",
                        name: "$category.name",
                    },
                },
            },
        ]);

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: {
                period,
                startDate,
                endDate: now,
                totalBooks: topBooks.length,
                books: topBooks,
            },
        });
    } catch (error) {
        console.error("top10Borrowed error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };