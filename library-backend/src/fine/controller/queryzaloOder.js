// d:\Library\library-backend\src\fine\controller\queryZaloOrder.js
import mongoose from "mongoose";
import crypto from "crypto";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";
import Notification from "../../notification/model/notification.js";

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

        const fine = await Fine.findById(fineId);
        if (!fine) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy đơn phạt",
            });
        }

        if (fine.userId.toString() !== userId.toString()) {
            return res.status(StatusCodes.FORBIDDEN).send({
                status: StatusCodes.FORBIDDEN,
                message: "Bạn không có quyền xem đơn phạt này",
            });
        }

        if (fine.isPayed) {
            return res.status(StatusCodes.OK).send({
                status: StatusCodes.OK,
                message: "Đơn phạt đã được thanh toán",
                data: { isPayed: true, paidAt: fine.paidAt },
            });
        }

        if (!fine.zalopayTransId) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Đơn phạt chưa có giao dịch ZaloPay",
            });
        }

        // Query trạng thái từ ZaloPay
        const app_id = process.env.ZALOPAY_APP_ID;
        const key1 = process.env.ZALOPAY_KEY1;
        const app_trans_id = fine.zalopayTransId;

        const data = `${app_id}|${app_trans_id}|${key1}`;
        const mac = crypto.createHmac("sha256", key1).update(data).digest("hex");

        const queryParams = {
            app_id: app_id,
            app_trans_id: app_trans_id,
            mac: mac,
        };

        console.log("==================== QUERY ZALOPAY ORDER ====================");
        console.log("App Trans ID:", app_trans_id);
        console.log("Query params:", queryParams);

        const response = await fetch("https://sb-openapi.zalopay.vn/v2/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(queryParams),
        });

        const result = await response.json();
        console.log("ZaloPay Query Result:", result);
        console.log("============================================================");

        // return_code: 1 = Thành công, 2 = Thất bại, 3 = Đang xử lý
        if (result.return_code === 1) {
            // Cập nhật trạng thái
            fine.isPayed = true;
            fine.paymentMethod = "QR_CODE";
            fine.paidAt = new Date();
            fine.zalopayTransactionNo = result.zp_trans_id;
            fine.adminNote = `Thanh toán ZaloPay thành công lúc ${new Date().toLocaleString("vi-VN")}`;
            await fine.save();

            // Tạo notification
            await Notification.create({
                userId: fine.userId,
                title: "Thanh toán phí phạt thành công",
                message: `Bạn đã thanh toán thành công phí phạt ${fine.amount.toLocaleString("vi-VN")} VNĐ qua ZaloPay.`,
                type: "FINE",
                isRead: false,
            });

            console.log("✅ Fine updated to isPayed = true");

            return res.status(StatusCodes.OK).send({
                status: StatusCodes.OK,
                message: "Thanh toán thành công",
                data: {
                    isPayed: true,
                    zp_trans_id: result.zp_trans_id,
                    amount: result.amount,
                    paidAt: fine.paidAt,
                },
            });
        } else if (result.return_code === 2) {
            return res.status(StatusCodes.OK).send({
                status: StatusCodes.OK,
                message: "Giao dịch thất bại hoặc đã bị hủy",
                data: { isPayed: false },
            });
        } else if (result.return_code === 3) {
            return res.status(StatusCodes.OK).send({
                status: StatusCodes.OK,
                message: "Giao dịch đang xử lý, vui lòng thử lại sau",
                data: { isPayed: false },
            });
        } else {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: result.return_message || "Không tìm thấy giao dịch",
                data: { isPayed: false },
            });
        }
    } catch (error) {
        console.error("queryZaloOrder error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ, vui lòng thử lại sau",
        });
    }
};

export default { excecute };