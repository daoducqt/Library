import crypto from 'crypto';
import querystring from 'qs';

class VNPayService {
    constructor() {
        this.vnp_TmnCode = process.env.VNP_TMN_CODE;
        this.vnp_HashSecret = process.env.VNP_HASH_SECRET;
        this.vnp_Url = process.env.VNP_URL;
        this.vnp_ReturnUrl = process.env.VNP_RETURN_URL;
    }

    createPaymentUrl(fineId, amount, bankCode, ipAddr) {
    const date = new Date();
    const createDate = this.formatDate(date);
    
    // ✅ THÊM: Expire date (15 phút sau)
    const expireDate = new Date(date.getTime() + 15 * 60 * 1000);
    const vnp_ExpireDate = this.formatDate(expireDate);
    
    const orderId = fineId + '_' + date.getTime();
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = `Thanh toan phi phat ${fineId}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = parseInt(amount, 10) * 100;
    vnp_Params['vnp_ReturnUrl'] = this.vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = vnp_ExpireDate;
    
    if (bankCode) {
        vnp_Params['vnp_BankCode'] = bankCode;
    }
    
    vnp_Params = this.sortObject(vnp_Params);
    
    // ✅ DEBUG: Log params trước khi hash
    console.log('==================== VNPAY DEBUG ====================');
    console.log('vnp_Params (sorted):', JSON.stringify(vnp_Params, null, 2));
    
    const signData = querystring.stringify(vnp_Params, { encode: false });
    console.log('signData (encode=false):', signData);
    console.log('vnp_HashSecret:', this.vnp_HashSecret);
    
    const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    console.log('vnp_SecureHash:', signed);
    
    vnp_Params['vnp_SecureHash'] = signed;
    
    const paymentUrl = this.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: true });
    console.log('Full payment URL:', paymentUrl);
    console.log('====================================================');
    
    return {
        paymentUrl,
        orderId
    };
}

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