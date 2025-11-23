import Book from "../models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const excecute = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Book.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if(!updated) {
            return res.status(404).send({
                status: 404,
                message: "Không tìm thấy sách",
            });
        }

        return res.send({
            status: 200,
            message: "Đã tăng lượt xem",
            data: updated.views,
        });
    } catch (error) {
        console.error(err);
        return res.status(500).send({ message: "Lỗi server" });
    }
};

export default { excecute };