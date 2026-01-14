// d:\Library\library-backend\src\fine\controller\createVietQR.js
import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";

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

        // Thông tin ngân hàng (lấy từ .env hoặc hardcode)
        const BANK_ID = process.env.BANK_ID || "970422"; // MB Bank
        const ACCOUNT_NO = process.env.BANK_ACCOUNT_NO || "0123456789";
        const ACCOUNT_NAME = process.env.BANK_ACCOUNT_NAME || "LIBRARY SYSTEM";
        
        // Tạo nội dung chuyển khoản có mã unique
        const transferContent = `PHIPHAT ${fineId.slice(-8)}`;
        
        // Lưu transferContent vào fine để verify sau
        fine.vietqrTransferContent = transferContent;
        await fine.save();

        // Tạo VietQR URL
        const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${fine.amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

        console.log('==================== VIETQR CREATED ====================');
        console.log('Fine ID:', fineId);
        console.log('Amount:', fine.amount);
        console.log('Transfer Content:', transferContent);
        console.log('QR URL:', qrUrl);
        console.log('=======================================================');

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Tạo mã QR thanh toán thành công",
            data: {
                fine: {
                    _id: fine._id,
                    amount: fine.amount,
                    daysLate: fine.daysLate,
                    reason: fine.reason,
                    createdAt: fine.createdAt,
                },
                payment: {
                    qr_url: qrUrl,
                    bank_id: BANK_ID,
                    account_no: ACCOUNT_NO,
                    account_name: ACCOUNT_NAME,
                    amount: fine.amount,
                    transfer_content: transferContent,
                    note: "Vui lòng chuyển khoản ĐÚNG nội dung để hệ thống tự động xác nhận"
                },
            },
        });
    } catch (error) {
        console.error("createVietQR error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ, vui lòng thử lại sau",
        });
    }
};

export default { excecute };