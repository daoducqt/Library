import Book from "../models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const { keyword, subject, author } = req.query;
    
        const query = {};

        // keyword tìm kiếm trong title 
        if (keyword) {
            query.title = { $regex: keyword, $options: "i" }; // 'i' for case-insensitive
        }

        // filter theo subject
        if (subject) {
            query.subjects = subject.toLowerCase();
        }

        // filter theo author
        if (author) {
            query.author = { $regex: author, $options: "i" };
        }

        if (!keyword && !subject && !author) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Vui lòng truyền keyword",
            });
        }

        const data = await Book.find(query);

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            total: data.length,
            data: data,
        });

        } catch (error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };