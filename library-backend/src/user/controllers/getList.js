import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import User from "../models/User.js";
import { pickObjectValueByKey } from "../../../core/validation/object.js";

const excecute = async (req, res) => {
    try {
        const currentUser = req.user;

        //Lấy limit và page từ query, mặc định nếu không có
        const { limit = 10, page = 1 } = pickObjectValueByKey(req.query, ["limit", "page"]);
        const parsedLimit = Math.max(parseInt(limit), 1);
        const parsedPage = Math.max(parseInt(page), 1);
        const skip = (parsedPage - 1) * parsedLimit;

        const [total, items] = await Promise.all([
            User.countDocuments(),
            User.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parsedLimit),
        ]);

        const hasNextPage = total > parsedPage * parsedLimit;

        return res.status(StatusCodes.OK).json({
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
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            data: null,
        });
    }
};

export default { excecute };