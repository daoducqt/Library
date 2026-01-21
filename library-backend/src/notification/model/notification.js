import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        title: { 
            type: String, 
            required: true 
        },
        message: { 
            type: String, 
            required: true 
        },
        link: { 
            type: String, 
            default: null 
        },
        type: {
            type: String,
            enum: [
                //USER NOTIFICATIONS
                "BORROW",              // User đặt sách (status = PENDING)
                "BORROW_CONFIRM",      // User nhận sách tại quầy (status = BORROWED)
                "RETURN",              // User trả sách
                "DUE_SOON",            // Sắp quá hạn trả
                "OVERDUE",             // Đã quá hạn
                "FINE",                // Thông báo phạt
                "WISHLIST_AVAILABLE",  // Sách trong wishlist có sẵn
                
                //ADMIN NOTIFICATIONS 
                "ADMIN_NEW_BORROW",      // Admin: User đặt sách mới
                "ADMIN_CONFIRM_BORROW",  // Admin: Đã xác nhận user nhận sách
                "ADMIN_RETURN",          // Admin: User trả sách
                "ADMIN_OVERDUE",         // Admin: Cảnh báo user quá hạn
                "ADMIN_FINE_PAYMENT",    // Admin: User thanh toán phạt
                "ADMIN_USER_VIOLATION",  // Admin: User vi phạm nhiều lần
                
                "OTHER"                  
            ],
            default: "OTHER"
        },
        loanId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Loan",
            default: null 
        },
        bookId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Book",
            default: null 
        },
        fineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fine",
            default: null
        },
        isRead: { 
            type: Boolean, 
            default: false 
        },
        targetRole: {
            type: String,
            enum: ["USER", "ADMIN", "SUPER_ADMIN"],
            default: "USER"
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);