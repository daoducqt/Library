import { notifyReturn } from "../../notification/services/notification.service.js";
import mongoose from "mongoose";
import Loan from "../model/loan.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Fine from "../../fine/model/fine.js";
import Wishlist from "../../whislist/model/whislist.model.js";
import Notification from "../../notification/model/notification.js";
import { generatePickupCode } from "../service/loan.service.js";

const excecute = async (req, res) => {
    try {
        const { loanId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(loanId)) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Loan ID không hợp lệ",
            });
        }

        const loan = await Loan.findById(loanId).populate("bookId userId");
        if (!loan) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy thông tin mượn sách",
            });
        }

        if (loan.status !== "BORROWED" && loan.status !== "OVERDUE") {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Sách đã được trả hoặc đã bị hủy",
            });
        }

        //  CHECK: Có Fine chưa thanh toán không?
        const unpaidFine = await Fine.findOne({ 
            loanId: loan._id, 
            isPayed: false 
        });

        //  CHẶN: Nếu có Fine chưa thanh toán
        if (unpaidFine) {
            return res.status(StatusCodes.BAD_REQUEST).send({
                status: StatusCodes.BAD_REQUEST,
                message: "Không thể trả sách. User phải thanh toán phạt trước!",
                data: {
                    canReturn: false,
                    hasFine: true,
                    fine: {
                        _id: unpaidFine._id,
                        amount: unpaidFine.amount,
                        daysLate: unpaidFine.daysLate,
                        createdAt: unpaidFine.createdAt
                    },
                    user: {
                        _id: loan.userId._id,
                        fullName: loan.userId.fullName,
                        email: loan.userId.email,
                        phone: loan.userId.phone
                    },
                    loan: {
                        _id: loan._id,
                        bookTitle: loan.bookId.title,
                        borrowDate: loan.borrowDate,
                        dueDate: loan.dueDate
                    }
                }
            });
        }

        //  CHO PHÉP TRẢ SÁCH: Không có Fine hoặc đã thanh toán
        const now = new Date();
        loan.returnDate = now;
        loan.status = "RETURNED";
        await loan.save();

        // ========================================
        //  KIỂM TRA WISHLIST: Có ai đặt trước không?
        // ========================================
        const wishlistUser = await Wishlist.findOne({
            bookId: loan.bookId._id,
            status: "PENDING"
        })
        .sort({ createdAt: 1 }) // Lấy người đặt sớm nhất
        .populate("userId", "userName fullName email");

        let wishlistNotified = null;

        if (wishlistUser) {
            console.log(` Found wishlist user for book: ${loan.bookId.title}`);
            
            // Tạo pickCode cho user wishlist
            const pickCode = await generatePickupCode();
            const pickupExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
            const borrowDate = new Date();
            const dueDate = new Date(borrowDate.getTime() + 14 * 86400000); // 14 ngày

            // Tạo Loan mới cho user wishlist
            const newLoan = await Loan.create({
                userId: wishlistUser.userId._id,
                bookId: loan.bookId._id,
                borrowDate,
                dueDate,
                status: "PENDING",
                pickCode,
                pickupExpiry,
            });

            console.log(` Created loan for wishlist user. PickCode: ${pickCode}`);

            // Update wishlist status
            wishlistUser.status = "NOTIFIED";
            wishlistUser.notifiedAt = new Date();
            await wishlistUser.save();

            // Gửi notification cho user wishlist
            await Notification.create({
                userId: wishlistUser.userId._id,
                title: "Sách bạn đặt đã có sẵn!",
                message: `Sách "${loan.bookId.title}" đã có sẵn. Mã lấy sách: ${pickCode}. Vui lòng lên thư viện trong 24 giờ.`,
                type: "WISHLIST_AVAILABLE",
                bookId: loan.bookId._id,
                isRead: false,
            });

            console.log(`📧 Notification sent to user: ${wishlistUser.userId.fullName}`);

            wishlistNotified = {
                userId: wishlistUser.userId._id,
                userName: wishlistUser.userId.fullName,
                pickCode,
                pickupExpiry,
            };

            // KHÔNG TĂNG availableCopies vì đã reserve cho wishlist user
            console.log(`🔒 Book reserved for wishlist user, not increasing availableCopies`);
        } else {
            // Không có wishlist → Trả sách về kho bình thường
            await Book.findByIdAndUpdate(loan.bookId._id, {
                $inc: { availableCopies: 1 }
            });
            console.log(`✅ Book returned to inventory, availableCopies increased`);
        }

        // Gửi thông báo trả sách cho user trả
        try {
            await notifyReturn(loan.userId._id, loan.bookId.title, loan._id, 0);
        } catch (notiErr) {
            console.error("Error sending notification:", notiErr);
        }

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: wishlistNotified 
                ? `Trả sách thành công. Sách đã được đặt trước bởi ${wishlistNotified.userName}`
                : "Trả sách thành công",
            data: {
                canReturn: true,
                hasFine: false,
                loan: loan,
                book: {
                    title: loan.bookId.title,
                    availableCopies: wishlistNotified 
                        ? loan.bookId.availableCopies  // Không tăng
                        : loan.bookId.availableCopies + 1 // Tăng 1
                },
                wishlistNotified, // Thông tin user được notify (nếu có)
            }
        });

    } catch (error) {
        console.error("Return error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };