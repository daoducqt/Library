import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";
import Notification from "../../notification/model/notification.js";
import ZaloPayService from "../services/zalo.service.js";

const excecute = async (req, res) => {
    try {
        const { data: dataStr, mac: reqMac } = req.body;

        console.log('==================== ZALOPAY CALLBACK ====================');
        console.log('Request body:', req.body);
        console.log('==========================================================');

        // Verify callback từ ZaloPay
        const isValid = ZaloPayService.verifyCallback(dataStr, reqMac);
        
        if (!isValid) {
            console.error('Invalid callback signature');
            return res.json({ return_code: -1, return_message: "mac not equal" });
        }

        const dataJson = JSON.parse(dataStr);
        console.log('Callback data:', dataJson);

        // Extract fineId từ app_trans_id (format: YYMMDD_fineId_transID)
        const app_trans_id = dataJson.app_trans_id;
        const fineId = app_trans_id.split('_')[1];

        const fine = await Fine.findById(fineId).populate('userId', 'username email');
        
        if (!fine) {
            console.error('Fine not found:', fineId);
            return res.json({ return_code: 0, return_message: "success" });
        }

        if (fine.isPayed) {
            console.log('Fine already paid:', fineId);
            return res.json({ return_code: 0, return_message: "success" });
        }

        // Cập nhật trạng thái thanh toán
        fine.isPayed = true;
        fine.paymentMethod = "QR_CODE";
        fine.zalopayTransId = app_trans_id;
        fine.zalopayTransactionNo = dataJson.zp_trans_id;
        fine.adminNote = `Thanh toán ZaloPay thành công lúc ${new Date().toLocaleString('vi-VN')}`;
        await fine.save();

        console.log('Fine updated successfully:', fineId);

        // Tạo notification cho user
        await Notification.create({
            userId: fine.userId._id,
            title: "Thanh toán phí phạt thành công",
            message: `Bạn đã thanh toán thành công phí phạt ${fine.amount.toLocaleString('vi-VN')} VNĐ qua ZaloPay.`,
            type: "FINE",
            isRead: false
        });

        console.log('Notification created for user:', fine.userId._id);

        return res.json({ return_code: 1, return_message: "success" });
    } catch (error) {
        console.error("zalopayCallback error:", error);
        return res.json({ return_code: 0, return_message: error.message });
    }
};

export default { excecute };