import Notification from "../model/notification.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import mongoose from "mongoose";

const excecute = async (req, res) => {
    try {
        const user = req.user;

        if (!mongoose.Types.ObjectId.isValid(user._id)){
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "ID người dùng không hợp lệ",
            })
        }

        const result = await Notification.updateMany(
            { userId: user._id, isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: result,
        });

    } catch (err) {
        console.error("Mark all notifications as read error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };