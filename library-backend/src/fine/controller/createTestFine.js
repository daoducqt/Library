// d:\Library\library-backend\src\fine\controller\createTestFine.js
import mongoose from "mongoose";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Fine from "../model/fine.js";
import User from "../../user/models/User.js";

const excecute = async (req, res) => {
    try {
        const { userId, daysLate, amount } = req.body;

        // Validate input
        if (!userId) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Thiếu userId (ID người dùng)",
            });
        }

        if (!daysLate || daysLate < 1) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Thiếu daysLate hoặc phải >= 1 (số ngày trễ)",
            });
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "userId không hợp lệ",
            });
        }

        // Kiểm tra user tồn tại
        const user = await User.findById(userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy user",
            });
        }

        // Tính amount (nếu không truyền vào)
        const fineAmount = amount || daysLate * 5000;

        // Tạo fine (không cần loanId)
        const fine = await Fine.create({
            userId: userId,
            loanId: null, // Không cần loan
            daysLate: daysLate,
            amount: fineAmount,
            isPayed: false,
            paymentMethod: null,
            adminNote: "Fine test được tạo bởi admin"
        });

        // Populate user info
        const populatedFine = await Fine.findById(fine._id)
            .populate('userId', 'username email');

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Tạo fine test thành công",
            data: {
                fine: populatedFine,
                summary: {
                    user: user.username,
                    daysLate: daysLate,
                    amount: fineAmount,
                    amountPerDay: 5000
                }
            }
        });
    } catch (error) {
        console.error("createTestFine error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Lỗi máy chủ: " + error.message,
        });
    }
};

export default { excecute };