import crypto from 'crypto';
import querystring from 'qs';

class VNPayService {
    constructor() {
        this.vnp_TmnCode = process.env.VNP_TMN_CODE;
        this.vnp_HashSecret = process.env.VNP_HASH_SECRET;
        this.vnp_Url = process.env.VNP_URL;
        this.vnp_ReturnUrl = process.env.VNP_RETURN_URL;
    }

    /**
     * Tạo URL thanh toán VNPay
     * @param {String} fineId - ID của fine
     * @param {Number} amount - Số tiền cần thanh toán (VND)
     * @param {String} bankCode - Mã ngân hàng (NCB, VNPAYQR, etc.) hoặc null
     * @param {String} ipAddr - IP của user
     */
    createPaymentUrl(fineId, amount, bankCode, ipAddr) {
        const date = new Date();
        const createDate = this.formatDate(date);
        const orderId = fineId + '_' + date.getTime(); // Mã giao dịch unique
        
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = `Thanh toan phi phat ${fineId}`;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu nhân 100
        vnp_Params['vnp_ReturnUrl'] = this.vnp_ReturnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        
        // Nếu có bankCode thì thêm vào (để chọn phương thức thanh toán)
        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }
        
        vnp_Params = this.sortObject(vnp_Params);
        
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        
        const paymentUrl = this.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });
        
        return {
            paymentUrl,
            orderId
        };
    }

    /**
     * Verify return URL từ VNPay
     */
    verifyReturnUrl(vnp_Params) {
        const secureHash = vnp_Params['vnp_SecureHash'];
        
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        
        vnp_Params = this.sortObject(vnp_Params);
        
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        
        return secureHash === signed;
    }

    /**
     * Verify IPN (callback từ VNPay server)
     */
    verifyIpnCall(vnp_Params) {
        return this.verifyReturnUrl(vnp_Params);
    }

    sortObject(obj) {
        const sorted = {};
        const keys = Object.keys(obj).sort();
        keys.forEach(key => {
            sorted[key] = obj[key];
        });
        return sorted;
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    getResponseMessage(code) {
        const messages = {
            '00': 'Giao dịch thành công',
            '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
            '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
            '10': 'Khách hàng xác thực thông tin không đúng quá 3 lần',
            '11': 'Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch.',
            '12': 'Thẻ/Tài khoản bị khóa.',
            '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
            '24': 'Khách hàng hủy giao dịch',
            '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
            '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
            '75': 'Ngân hàng thanh toán đang bảo trì.',
            '79': 'KH nhập sai mật khẩu thanh toán quá số lần quy định.',
            '99': 'Các lỗi khác'
        };
        return messages[code] || 'Lỗi không xác định';
    }
}

export default new VNPayService();