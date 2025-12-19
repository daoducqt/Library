import Notification from "../model/notification.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import mongoose from "mongoose";

const excecute = async (req, res) => {
    try {
        const { notificationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(notificationId)){
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "ID thông báo không hợp lệ",
            })
        }

        const deleted = await Notification.findByIdAndDelete(notificationId);

        if (!deleted) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Thông báo không tồn tại",
            });
        }

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Xóa thông báo thành công",
        });
    } catch (err) {
        console.error("Delete notification error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };
