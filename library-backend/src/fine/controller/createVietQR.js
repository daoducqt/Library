import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";
import { PayOS } from "@payos/node";

const payOS = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

const excecute = async (req, res) => {
    try {
        const { fineId } = req.params;
        //  XÓA: const userId = req.user._id;

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

        // if (fine.userId.toString() !== userId.toString()) {
        //     return res.status(StatusCodes.FORBIDDEN).send({
        //         status: StatusCodes.FORBIDDEN,
        //         message: "Bạn không có quyền thanh toán đơn phạt này",
        //     });
        // }

        if (fine.isPayed) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Đơn phạt đã được thanh toán",
            });
        }

        // Tạo orderCode unique (số nguyên dương, tối đa 9 số)
        const orderCode = Number(String(Date.now()).slice(-9));
        
        // Tạo nội dung chuyển khoản
        const transferContent = `PHIPHAT ${fineId.slice(-8)}`;

        console.log('==================== CREATING PAYOS PAYMENT ====================');
        console.log('Fine ID:', fineId);
        console.log('Order Code:', orderCode);
        console.log('Amount:', fine.amount);
        console.log('Description:', transferContent);
        console.log('===============================================================');

        // Tạo payment link qua PayOS
        const paymentData = {
            orderCode: orderCode,
            amount: fine.amount,
            description: transferContent,
            returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
            cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
        };

        const paymentLinkResponse = await payOS.paymentRequests.create(paymentData);

        // Lưu thông tin vào fine
        fine.vietqrTransferContent = transferContent;
        fine.payosOrderCode = orderCode;
        fine.payosPaymentLinkId = paymentLinkResponse.paymentLinkId;
        await fine.save();

        console.log('✅ PayOS Payment Created Successfully');
        console.log('Payment Link ID:', paymentLinkResponse.paymentLinkId);
        console.log('Checkout URL:', paymentLinkResponse.checkoutUrl);
        console.log('QR Code:', paymentLinkResponse.qrCode);

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Tạo mã QR thanh toán thành công",
            data: {
                fine: {
                    _id: fine._id,
                    amount: fine.amount,
                    daysLate: fine.daysLate,
                    createdAt: fine.createdAt,
                },
                payment: {
                    qr_url: paymentLinkResponse.qrCode,
                    checkout_url: paymentLinkResponse.checkoutUrl,
                    order_code: orderCode,
                    payment_link_id: paymentLinkResponse.paymentLinkId,
                    account_number: paymentLinkResponse.accountNumber,
                    account_name: paymentLinkResponse.accountName,
                    amount: fine.amount,
                    transfer_content: transferContent,
                    note: "Quét mã QR hoặc truy cập link để thanh toán"
                },
            },
        });
    } catch (error) {
        console.error("createVietQR error:", error);
        console.error("Error details:", error.response?.data || error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.response?.data?.message || error.message || "Lỗi máy chủ, vui lòng thử lại sau",
        });
    }
};

export default { excecute };