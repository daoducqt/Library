// d:\Library\library-backend\src\fine\controller\vietqrWebhook.js
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";
import Notification from "../../notification/model/notification.js";

const excecute = async (req, res) => {
    try {
        const { transferContent, amount, transactionId } = req.body;

        console.log('==================== VIETQR WEBHOOK ====================');
        console.log('Transfer Content:', transferContent);
        console.log('Amount:', amount);
        console.log('Transaction ID:', transactionId);
        console.log('=======================================================');

        // Tìm fine theo transferContent
        const fine = await Fine.findOne({ 
            vietqrTransferContent: transferContent,
            isPayed: false 
        }).populate('userId', 'username email');

        if (!fine) {
            console.error('Fine not found for transferContent:', transferContent);
            return res.status(StatusCodes.OK).send({
                status: StatusCodes.OK,
                message: "Không tìm thấy đơn phạt hoặc đã thanh toán",
            });
        }

        // Kiểm tra số tiền
        if (parseInt(amount) !== fine.amount) {
            console.error('Amount mismatch:', amount, 'vs', fine.amount);
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Số tiền không khớp",
            });
        }

        // Cập nhật trạng thái
        fine.isPayed = true;
        fine.paymentMethod = "BANK_TRANSFER";
        fine.paidAt = new Date();
        fine.vietqrTransactionId = transactionId;
        fine.adminNote = `Thanh toán VietQR thành công lúc ${new Date().toLocaleString("vi-VN")}`;
        await fine.save();

        // Tạo notification
        await Notification.create({
            userId: fine.userId._id,
            title: "Thanh toán phí phạt thành công",
            message: `Bạn đã thanh toán thành công phí phạt ${fine.amount.toLocaleString("vi-VN")} VNĐ qua chuyển khoản ngân hàng.`,
            type: "FINE",
            isRead: false,
        });

        console.log(' Fine updated to isPayed = true');

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Webhook processed successfully",
        });
    } catch (error) {
        console.error("vietqrWebhook error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ",
        });
    }
};

export default { excecute };