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
                "BORROW", "RETURN", "DUE_SOON", "OVERDUE", "FINE",
                "ADMIN_NEW_BORROW",
                "ADMIN_RETURN",
                "ADMIN_OVERDUE", 
                "ADMIN_FINE_PAYMENT",
                "ADMIN_USER_VIOLATION",
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