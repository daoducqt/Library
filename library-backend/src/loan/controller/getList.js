import Loan from "../model/loan.js";
import { pickObjectValueByKey } from "../../../core/validation/object.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const user = req.user;

        const { limit = 10, page = 1 } = pickObjectValueByKey(req.query, ["limit", "page"]);
        const parsedLimit = Math.max(1, parseInt(limit));
        const parsedPage = Math.max(1, parseInt(page));
        const skip = (parsedPage - 1) * parsedLimit;

        const filter = {};
        if (user.role === "USER") {
            filter.userId = user._id;
        }

        const [total, items] = await Promise.all([
            Loan.countDocuments(filter),
            Loan.find(filter)
                .populate("userId", "userName fullName")
                .populate("bookId", "title author")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parsedLimit),
        ]);

        const hasNextPage = parsedPage * parsedLimit < total;

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: {
                items,
                pagination: {
                    total,
                    page: parsedPage,
                    limit: parsedLimit,
                    hasNextPage,
                },
            },
        });

    } catch (err) {
        console.error("List loan error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };
