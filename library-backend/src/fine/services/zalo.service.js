import crypto from 'crypto';
import moment from 'moment';
import QRCode from 'qrcode';

class ZaloPayService {
    constructor() {
        this.app_id = process.env.ZALOPAY_APP_ID;
        this.key1 = process.env.ZALOPAY_KEY1;
        this.key2 = process.env.ZALOPAY_KEY2;
        this.endpoint = process.env.ZALOPAY_ENDPOINT;
        this.callback_url = process.env.ZALOPAY_CALLBACK_URL;
    }

    async createOrder(fineId, amount, description = "Thanh toán phí phạt") {
        const transID = Math.floor(Math.random() * 1000000);
        const app_trans_id = `${moment().format('YYMMDD')}_${fineId}_${transID}`;
        
        const order = {
            app_id: this.app_id,
            app_user: "user123",
            app_time: Date.now(),
            app_trans_id: app_trans_id,
            amount: amount,
            item: JSON.stringify([{
                itemid: fineId,
                itemname: description,
                itemprice: amount,
                itemquantity: 1
            }]),
            embed_data: JSON.stringify({
                redirecturl: process.env.FRONTEND_URL + "/payment-success",
                fineId: fineId
            }),
            callback_url: this.callback_url,
            description: description,
            bank_code: "",
        };

        const data = `${this.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
        order.mac = crypto.createHmac('sha256', this.key1).update(data).digest('hex');

        console.log('==================== ZALOPAY DEBUG ====================');
        console.log('Order Data:', JSON.stringify(order, null, 2));
        console.log('======================================================');

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(order)
            });

            const result = await response.json();
            console.log('ZaloPay Response:', result);

            if (result.return_code === 1) {
                // ✅ Tạo QR code từ order_url
                const qrCodeDataURL = await QRCode.toDataURL(result.order_url, {
                    errorCorrectionLevel: 'M',
                    type: 'image/png',
                    width: 300,
                    margin: 2,
                });

                return {
                    success: true,
                    order_url: result.order_url,
                    app_trans_id: app_trans_id,
                    zp_trans_token: result.zp_trans_token,
                    qr_code: qrCodeDataURL, // ✅ Base64 QR code
                };
            } else {
                return {
                    success: false,
                    message: result.return_message || 'Lỗi tạo đơn hàng ZaloPay',
                    return_code: result.return_code
                };
            }
        } catch (error) {
            console.error('ZaloPay API Error:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    verifyCallback(dataStr, reqMac) {
        const mac = crypto.createHmac('sha256', this.key2)
            .update(dataStr)
            .digest('hex');

        console.log('Verify Callback - dataStr:', dataStr);
        console.log('Verify Callback - Received MAC:', reqMac);
        console.log('Verify Callback - Computed MAC:', mac);

        return mac === reqMac;
    }

    getOrderStatus(app_trans_id) {
        const data = `${this.app_id}|${app_trans_id}|${this.key1}`;
        const mac = crypto.createHmac('sha256', this.key1).update(data).digest('hex');

        return {
            app_id: this.app_id,
            app_trans_id: app_trans_id,
            mac: mac
        };
    }
}

export default new ZaloPayService();