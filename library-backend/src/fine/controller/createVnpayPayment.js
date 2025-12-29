import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";
import VnPayService from "../services/vnpay.service.js";

const excecute = async (req, res) => {
    try {
        const { fineId } = req.params;
        const { bankCode } = req.body;
        const userId = req.user.id;

        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            '127.0.0.1';

        if (!mongoose.Types.ObjectId.isValid(fineId)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "ID phạt không hợp lệ",
            });
        }

        const fine = await Fine.findById(fineId);
        if (!fine) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status : StatusCodes.NOT_FOUND,
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

        const { paymentUrl, orderId } = VnPayService.createPaymentUrl(
            fineId,
            fine.amount,
            bankCode,
            ipAddr
        );

        fine.vnpayOrderId = orderId;
        fine.vnpayBankCode = bankCode === "VNPAYQR" ? "QR" : "BANK_TRANSFER";
        await fine.save();

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Tạo URL thanh toán VNPay thành công",
            data: {
                paymentUrl,
                orderId,
                amount: fine.amount,
                bankCode: bankCode || "All"
            },
        });
    } catch (error) {
        console.error("createVnpayPayment error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ, vui lòng thử lại sau",
        });
    }
};
export default { excecute }; 