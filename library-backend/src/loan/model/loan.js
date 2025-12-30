import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },

        status: {
        type: String,
            enum: ["PENDING","BORROWED", "RETURNED", "OVERDUE", "CANCELLED"],
            default: "PENDING",
    },

        pickCode: { type: String, required: true, unique: true },
        pickupExpiry: { type: Date},
        comfirmedAt: { type: Date },
        comfirmedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

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