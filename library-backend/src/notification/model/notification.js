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
            enum: ["BORROW", "RETURN", "DUE_SOON", "OVERDUE", "FINE", "OTHER"],
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
        isRead: { 
            type: Boolean, 
            default: false 
        },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);