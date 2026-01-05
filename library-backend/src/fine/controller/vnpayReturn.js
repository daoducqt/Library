import Fine from "../model/fine.js";
import VnPayService from "../services/vnpay.service.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const excecute = async (req, res) => {
    try {
        const vnp_Params = req.query;

        const isValid = VnPayService.verifyReturnUrl(vnp_Params);
        if (!isValid) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Dữ liệu trả về không hợp lệ",
            });
        }

        const orderId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const transactionNo = vnp_Params['vnp_TransactionNo'];
        const amount = parseInt(vnp_Params['vnp_Amount']) / 100;
        const bankCode = vnp_Params['vnp_BankCode'];

        const fine = await Fine.findOne({ vnpayOrderId: orderId });

        if (!fine) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy đơn phạt tương ứng với giao dịch",
            });
        }

        if (responseCode === '00') {
            if (fine.isPayed) {
                return res.redirect(`${process.env.FRONTEND_URL}/payment-success?fineId=${fine._id}&amount=${amount}&message=already_paid`);
            }
        
            fine.isPayed = true;
            fine.paidAt = new Date();
            fine.paymentMethod = "QR_CODE";
            fine.vnpayTransactionNo = transactionNo;
            fine.vnpayReponseCode = responseCode;
            fine.vnpayBankCode = bankCode;
            await fine.save();

            return res.redirect(`${process.env.FRONTEND_URL}/payment-success?fineId=${fine._id}&amount=${amount}`);
        } else {
            fine.vnpayReponseCode = responseCode;
            await fine.save();

            const errorMessage = VnPayService.getResponseMessage(responseCode);
            return res.redirect(`${process.env.FRONTEND_URL}/payment-failure?message=${encodeURIComponent(errorMessage)}`);
        }
    } catch (error) {
        console.error("vnpayReturn error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ, vui lòng thử lại sau",
        });
    }
};
export default { excecute };