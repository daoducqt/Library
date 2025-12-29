import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";
import VnPayService from "../services/vnpay.service.js";

const excecute = async (req, res) => {
    try {
        const vnp_Params = req.body;

        const isValid = VnPayService.verifyReturnUrl(vnp_Params);
        if (!isValid) {
            return res.status(StatusCodes.OK).json({
                RspCode: "97",
                Message: "Dữ liệu không hợp lệ",
            });
        }

        const orderId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const transactionNo = vnp_Params['vnp_TransactionNo'];
        const amount = parseInt(vnp_Params['vnp_Amount']) / 100;
        const bankCode = vnp_Params['vnp_BankCode'];

        const fine = await Fine.findOne({ vnpayOrderId: orderId });

        if (!fine) {
            return res.status(StatusCodes.OK).json({
                RspCode: "01",
                Message: "Không tìm thấy đơn phạt tương ứng với giao dịch",
            });
        }

        if (fine.amount !== amount) {
            return res.status(StatusCodes.OK).json({
                RspCode: "04",
                Message: "Số tiền không khớp",
            });
        }

        if (fine.isPayed) {
            return res.status(StatusCodes.OK).json({
                RspCode: "02",
                Message: "Đơn phạt đã được thanh toán",
            });
        }

        if (responseCode === '00') {
            fine.isPayed = true;
            fine.paidAt = new Date();
            fine.vnpayTransactionNo = transactionNo;
            fine.vnpayReponseCode = responseCode;
            fine.vnpayBankCode = bankCode;
            await fine.save();

            return res.status(StatusCodes.OK).json({
                RspCode: "00",
                Message: "Thanh toán thành công",
            });
        } else {
            fine.vnpayReponseCode = responseCode;
            await fine.save();

            return res.status(StatusCodes.OK).json({
                RspCode: "03",
                Message: "Thanh toán không thành công",
            });
        }
    } catch (error) {
        console.error("vnpayIPN error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            RspCode: "99",
            Message: "Lỗi máy chủ, vui lòng thử lại sau",
        });
    }
};
export default { excecute };