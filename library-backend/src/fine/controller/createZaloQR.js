import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";
import ZaloPayService from "../services/zalo.service.js";

const excecute = async (req, res) => {
    try {
        const { fineId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(fineId)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "ID phạt không hợp lệ",
            });
        }

        const fine = await Fine.findById(fineId).populate('loanId');
        if (!fine) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy đơn phạt",
            });
        }

        if (fine.userId.toString() !== userId.toString()) {
            return res.status(StatusCodes.FORBIDDEN).send({
                status: StatusCodes.FORBIDDEN,
                message: "Bạn không có quyền thanh toán đơn phạt này",
            });
        }

        if (fine.isPayed) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Đơn phạt đã được thanh toán",
            });
        }

        const result = await ZaloPayService.createOrder(
            fineId,
            fine.amount,
            `Thanh toan phi phat ${fineId}`
        );

        if (!result.success) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: result.message || "Không thể tạo thanh toán ZaloPay",
            });
        }

        fine.zalopayTransId = result.app_trans_id;
        await fine.save();

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Tạo thanh toán ZaloPay thành công",
            data: {
                //  Thông tin đơn phạt
                fine: {
                    _id: fine._id,
                    amount: fine.amount,
                    daysLate: fine.daysLate,
                    reason: fine.reason,
                    createdAt: fine.createdAt,
                },
                //  Thông tin thanh toán
                payment: {
                    app_trans_id: result.app_trans_id,
                    order_url: result.order_url, // Backup nếu QR không load
                    qr_code: result.qr_code, //  Base64 QR code
                },
            },
        });
    } catch (error) {
        console.error("createZaloPayPayment error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ, vui lòng thử lại sau",
        });
    }
};

export default { excecute };