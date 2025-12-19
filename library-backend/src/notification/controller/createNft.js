// cần fix thêm nếu làm 
// 📢 Sách mới nhập
//💰 Khuyến mãi
//📅 Sự kiện thư viện
//🔧 Bảo trì hệ thống

import Notification from "../model/notification.js";
import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Joi from "joi";


const excecute = async (req, res) => {
    try {
        const { NotificationData } = req.body;
        const user = req.user;

        if (!mongoose.Types.ObjectId.isValid(user._id)){
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "ID người dùng không hợp lệ",
            })
        }

        const newNotification = new Notification({
            userId: user._id,
            ...NotificationData
        });

        const savedNotification = await newNotification.save();

        return res.status(StatusCodes.CREATED).send({
            status: StatusCodes.CREATED,
            message: ReasonPhrases.CREATED,
            data: savedNotification,
        });
    } catch (err) {
        console.error("Create notification error:", err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };