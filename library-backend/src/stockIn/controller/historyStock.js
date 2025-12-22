import StockHistory from '../model/stockIn.js';
import StatusCodes from '../../../core/utils/statusCode/statusCode.js';
import ReasonPhrases from '../../../core/utils/statusCode/reasonPhares.js';

const execute = async (req, res) => {
    try {
        const { bookId, type, limit = 10, page = 1 } = req.query;

        const filter = {};

        if (bookId) {
            filter.bookId = bookId;
        }
        if (type) {
            filter.type = type;
        }
        const parsedLimit = Math.max(1, parseInt(limit));
        const parsedPage = Math.max(1, parseInt(page));
        const skip = (parsedPage - 1) * parsedLimit;

        const [total, records] = await Promise.all([
            StockHistory.find(filter)
                .populate('bookId', 'title author coverId')
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parsedLimit),
            StockHistory.countDocuments(filter),
        ]);

        const hasNextPage = parsedPage * parsedLimit < total;
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: records,
            pagination: {
                total,
                page: parsedPage,
                limit: parsedLimit,
                hasNextPage,
            },
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: error.message,
        });
    }
};

export default { execute };