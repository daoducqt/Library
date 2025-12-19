import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import { markAsRead } from "../services/notification.service.js";
import mongoose from "mongoose";

const excecute = async (req, res) => {
    try {
        const { id } = req.params;  

        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Notification ID không hợp lệ",
            });
        }

        const updatedNotification = await markAsRead(id);

        if (!updatedNotification) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Thông báo không tồn tại",
            });
        }

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Đánh dấu thông báo đã đọc thành công",
            data: updatedNotification,
        });
    } catch (err) {
        console.error("Mark notification as read error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };