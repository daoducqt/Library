import Notification from "../model/notification.js";
import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const user = req.user;

        if (!mongoose.Types.ObjectId.isValid(user._id)){
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "ID người dùng không hợp lệ",
            })
        }
        
        const notifications = await Notification.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(10);

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: notifications,
        });
    } catch (err) {
        console.error("Get notifications error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
}

export default { excecute };