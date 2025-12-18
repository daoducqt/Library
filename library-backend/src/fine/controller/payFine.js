import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../models/fine.model.js";

const excecute = async (req, res) => {
    try {
        const { fineId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(fineId)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "ID phạt không hợp lệ",
            });
        }

        const fine = await Fine.findById(fineId);
        if (!fine) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status : StatusCodes.NOT_FOUND,
                message: "Không tìm thấy đơn phạt",
            });
        }

        if (fine.paid) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Đơn phạt đã được thanh toán",
            });
        }

        fine.isPaid = true;
        fine.paidAt = new Date();
        await fine.save();

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Thanh toán phạt thành công",
            data: fine,
        });
    } catch (error) {
        console.error("payFine error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ, vui lòng thử lại sau",
        });
    }
};
export default { excecute };