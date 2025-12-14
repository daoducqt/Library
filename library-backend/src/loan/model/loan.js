import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },

        status: {
        type: String,
            enum: ["BORROWED", "RETURNED", "OVERDUE", "CANCELLED"],
            default: "BORROWED",
    },

        borrowDate: { type: Date, default: Date.now },
        dueDate: { type: Date, required: true }, // ngày phải trả
        returnDate: { type: Date },              // ngày thực trả

        extendCount: { type: Number, default: 0, min: 0, max: 1 },
        
        extendHistory: [{
        extendedAt: { type: Date, default: Date.now },
        extraDays: Number,
        status: {
        type: String,
        enum: ["APPROVED", "REJECTED"],
        },
        reason: String, // lý do từ chối (nếu có)
    }],
    }, 
    { timestamps: true }
);

export default mongoose.model("Loan", LoanSchema);