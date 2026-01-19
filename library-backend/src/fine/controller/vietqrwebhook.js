// d:\Library\library-backend\src\fine\controller\vietqrwebhook.js
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";
import Notification from "../../notification/model/notification.js";

const excecute = async (req, res) => {
    try {
        console.log('==================== CASSO WEBHOOK ====================');
        console.log('Full Request Body:', JSON.stringify(req.body, null, 2));
        console.log('=======================================================');

        // Casso gửi data trong req.body.data (array of transactions)
        let transactions = [];
        
        if (req.body.data && Array.isArray(req.body.data)) {
            transactions = req.body.data;
        } else if (Array.isArray(req.body)) {
            transactions = req.body;
        } else if (req.body.transactions) {
            transactions = req.body.transactions;
        } else {
            // Nếu là single transaction object
            transactions = [req.body];
        }

        console.log('Parsed transactions:', transactions.length);

        if (transactions.length === 0) {
            console.log('No transactions found');
            return res.status(200).json({ success: true, message: 'No transactions' });
        }

        for (const transaction of transactions) {
            const { description, amount, id, tid } = transaction;
            const transactionId = id || tid;

            console.log('Processing transaction:');
            console.log('- Description:', description);
            console.log('- Amount:', amount);
            console.log('- Transaction ID:', transactionId);

            if (!description) {
                console.log('Skip - no description');
                continue;
            }

            // Extract transferContent từ description
            const match = description.match(/PHIPHAT\s+([a-zA-Z0-9]+)/i);
            if (!match) {
                console.log('Skip - invalid format:', description);
                continue;
            }

            const transferContentCode = match[1];
            const transferContent = `PHIPHAT ${transferContentCode}`;

            console.log('Looking for fine with:', transferContent);

            // Tìm fine
            const fine = await Fine.findOne({ 
                vietqrTransferContent: transferContent,
                isPayed: false 
            }).populate('userId', 'username email');

            if (!fine) {
                console.log('Fine not found');
                continue;
            }

            console.log('Found fine:', fine._id, 'Amount:', fine.amount);

            // Kiểm tra số tiền
            const transactionAmount = parseInt(amount);
            if (transactionAmount !== fine.amount) {
                console.log('Amount mismatch:', transactionAmount, 'vs', fine.amount);
                continue;
            }

            // Cập nhật trạng thái
            fine.isPayed = true;
            fine.paymentMethod = "BANK_TRANSFER";
            fine.paidAt = new Date();
            fine.vietqrTransactionId = transactionId;
            fine.adminNote = `Thanh toán Casso thành công lúc ${new Date().toLocaleString("vi-VN")}`;
            await fine.save();

            console.log('✅ Fine updated successfully');

            // Tạo notification
            await Notification.create({
                userId: fine.userId._id,
                title: "Thanh toán phí phạt thành công",
                message: `Bạn đã thanh toán thành công phí phạt ${fine.amount.toLocaleString("vi-VN")} VNĐ qua chuyển khoản ngân hàng.`,
                type: "FINE",
                isRead: false,
            });

            console.log('✅ Notification created');
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("vietqrWebhook error:", error);
        console.error("Stack:", error.stack);
        return res.status(200).json({ success: false, error: error.message });
    }
};

export default { excecute };