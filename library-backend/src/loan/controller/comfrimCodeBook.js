import Loan from "../model/loan.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Notification from "../../notification/model/notification.js";

const excecute = async (req, res) => {
    try {
        const { loanId } = req.params;
        const admin = req.user;

        if (!loanId) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Thiếu loanId",
            });
        }

        const loan = await Loan.findOne({
            _id: loanId,
            status: "PENDING",
        })
            .populate("userId", "userName email fullName")
            .populate("bookId", "title author availableCopies");

        if (!loan) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy yêu cầu hoặc đã được xác nhận",
            });
        }

        // Double check hết hạn
        if (new Date() > loan.pickupExpiry) {
            loan.status = "EXPIRED";
            await loan.save();

            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Mã đã hết hạn",
            });
        }

        // Double check sách còn không
        if (loan.bookId.availableCopies < 1) {
            loan.status = "CANCELLED";
            await loan.save();

            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Sách không còn bản để mượn",
            });
        }

        // Xác nhận
        loan.status = "BORROWED";
        loan.confirmedAt = new Date();
        loan.confirmedBy = admin._id;
        await loan.save();

        // Trừ sách
        await Book.findByIdAndUpdate(loan.bookId._id, {
            $inc: { availableCopies: -1 },
        });

        // Gửi thông báo
        try {
            // 1. Thông báo cho USER
            await Notification.create({
                userId: loan.userId._id,
                title: "Nhận sách thành công!",
                message: `Bạn đã nhận sách "${loan.bookId.title}". Vui lòng trả sách trước ngày ${loan.dueDate.toLocaleDateString('vi-VN')}.`,
                type: "BORROW_CONFIRM",
                loanId: loan._id,
                bookId: loan.bookId._id,
                link: `/loans/${loan._id}`,
                targetRole: "USER",
                isRead: false,
                metadata: {
                    bookTitle: loan.bookId.title,
                    dueDate: loan.dueDate
                }
            });

            // 2. Thông báo cho tất cả ADMIN
            const User = (await import("../../user/models/User.js")).default;
            const { RoleTypeEnum } = await import("../../user/models/User.js");

            const admins = await User.find({
                role: { $in: [RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN] }
            }).select('_id');

            if (admins.length > 0) {
                const adminNotifications = admins.map(adminUser => ({
                    userId: adminUser._id,
                    title: "Xác nhận mượn sách",
                    message: `${loan.userId.fullName || loan.userId.email} đã nhận sách "${loan.bookId.title}" tại quầy`,
                    type: "ADMIN_CONFIRM_BORROW",
                    loanId: loan._id,
                    bookId: loan.bookId._id,
                    link: `/admin/loans/${loan._id}`,
                    targetRole: "ADMIN",
                    isRead: false,
                    metadata: {
                        userName: loan.userId.fullName || loan.userId.email,
                        bookTitle: loan.bookId.title,
                        confirmedBy: admin._id,
                        confirmedAt: new Date()
                    }
                }));

                await Notification.insertMany(adminNotifications);
            }
        } catch (notiErr) {
            console.error("Error sending notification:", notiErr);
        }

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Xác nhận mượn sách thành công",
            data: {
                loan: {
                    _id: loan._id,
                    pickupCode: loan.pickCode,
                    status: loan.status,
                    confirmedAt: loan.confirmedAt,
                    dueDate: loan.dueDate,
                },
                user: loan.userId,
                book: loan.bookId,
            },
        });
    } catch (error) {
        console.error("Confirm code error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };