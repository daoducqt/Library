import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";
import Notification from "../../notification/model/notification.js";
import { notifyAdminFinePayment } from "../../notification/services/notification.service.js";
import User from "../../user/models/User.js";

const excecute = async (req, res) => {
    try {
        const { fineId } = req.params;
        const { note = "" } = req.body;

        if (!mongoose.Types.ObjectId.isValid(fineId)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "ID phạt không hợp lệ",
            });
        }

        const fine = await Fine.findById(fineId).populate("loanId");
        if (!fine) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status : StatusCodes.NOT_FOUND,
                message: "Không tìm thấy đơn phạt",
            });
        }

        if (fine.isPayed) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Đơn phạt đã được thanh toán",
            });
        }

        fine.isPayed = true;
        fine.paidAt = new Date();
        fine.paymentMethod = "CASH";
        fine.adminNote = note;
        await fine.save();

        // Tạo thông báo cho người dùng
        await Notification.create({
            userId: fine.userId,
            title: "Thanh toán phạt thành công",
            message: `Khoản phạt ${fine.amount.toLocaleString('vi-VN')} VND đã được thanh toán bằng tiền mặt.`,
            type: "FINE",
            loanId: fine.loanId._id,
            bookId: fine.loanId.bookId,
        });
        const user = await User.findById(fine.userId).select("fullName email");
        await notifyAdminFinePayment(user.fullName || user.email, fine.amount, fine._id,"CASH");
        
        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Đã xác nhận thanh toán tiền mặt",
            data: fine,
        });
    } catch (error) {
        console.error("confirmPay error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ, vui lòng thử lại sau",
        });
    }
};

export default { excecute };