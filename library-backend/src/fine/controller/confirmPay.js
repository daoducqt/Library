import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";
import Notification from "../../notification/model/notification.js";

const excecute = async (req, res) => {
    try {
        const { fineId } = req.params;

        const { paymentMethod = "CASH", note = "" } = req.body;

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

        if (fine.isPaid) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Đơn phạt đã được thanh toán",
            });
        }

        fine.isPaid = true;
        fine.paidAt = new Date();
        fine.paymentMethod = paymentMethod;
        fine.note = note;
        await fine.save();

        // Tạo thông báo cho người dùng về việc thanh toán phạt
        await Notification.create({
            userId: fine.loanId.userId,
            title: "Thanh toán phạt thành công",
            message: `Khoản phạt ${fine.amount} đã được thanh toán thành công.`,
            type: "FINE",
            loanId: fine.loanId._id,
            bookId: fine.loanId.bookId,
        });
        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Thanh toán phạt thành công",
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