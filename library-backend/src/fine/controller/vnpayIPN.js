import Fine from "../model/fine.js";
import VnPayService from "../services/vnpay.service.js";

const excecute = async (req, res) => {
    try {
        const vnp_Params = req.query;

        console.log('========== IPN START ==========');
        console.log('Time:', new Date().toISOString());
        console.log('Params:', vnp_Params);

        // Verify signature
        const isValid = VnPayService.verifyIpnCall(vnp_Params);
        if (!isValid) {
            console.log('❌ Invalid signature');
            return res.status(200).json({ RspCode: "97", Message: "Invalid Signature" });
        }

        const orderId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];

        console.log('OrderId:', orderId, 'ResponseCode:', responseCode);

        // Find fine
        const fine = await Fine.findOne({ vnpayOrderId: orderId });
        if (!fine) {
            console.log('❌ Order not found');
            return res.status(200).json({ RspCode: "01", Message: "Order not found" });
        }

        // Check if already paid
        if (fine.isPayed) {
            console.log('✅ Already paid');
            return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
        }

        // Update fine
        if (responseCode === '00') {
            fine.isPayed = true;
            fine.paidAt = new Date();
            fine.paymentMethod = "QR_CODE";
            fine.vnpayTransactionNo = vnp_Params['vnp_TransactionNo'];
            fine.vnpayReponseCode = responseCode;
            fine.vnpayBankCode = vnp_Params['vnp_BankCode'];
            await fine.save();
            
            console.log('✅ Payment confirmed');
            return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
        } else {
            fine.vnpayReponseCode = responseCode;
            await fine.save();
            
            console.log('❌ Payment failed');
            return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
        }
    } catch (error) {
        console.error("IPN Error:", error);
        return res.status(200).json({ RspCode: "99", Message: "System error" });
    }
};

export default { excecute };