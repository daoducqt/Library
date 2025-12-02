import Book from "../models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        // Lấy query params: page và limit (mặc định page=1, limit=20)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Validate page và limit
        if (page < 1 || limit < 1) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Page và limit phải lớn hơn 0",
            });
        }

        // Tính skip (bao nhiêu record bỏ qua)
        const skip = (page - 1) * limit;

        // Lấy tổng số sách
        const total = await Book.countDocuments();

        // Lấy dữ liệu phân trang
        const data = await Book.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate("categoryId", "name slug");; // Sắp xếp mới nhất trước

        // Tính tổng số trang
        const totalPages = Math.ceil(total / limit);

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        console.error("getBooks error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };