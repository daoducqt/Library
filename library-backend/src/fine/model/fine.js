import mongoose from "mongoose";

const FineSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        loanId: { type: mongoose.Schema.Types.ObjectId, ref: "LoanDetail", required: true },
        daysLate: { type: Number, required: true, min: 1},
        amount: { type: Number, required: true, min: 0},
        isPayed: { type: Boolean, default: false, index: true },
        paidAt: { type: Date },

        paymentMethod: { 
            type: String, 
            enum: ["CASH", "BANK_TRANSFER", "QR_CODE", "OTHER"],
            default: null
        },
        adminNote: { type: String, default: "" }, // Ghi chú của admin khi confirm
        
        vnpayOrderId: { type: String, default: null, index: true },
        vnpayTransactionNo: { type: String, default: null },
        vnpayReponseCode: { type: String, default: null },
        vnpayBankCode: { type: String, default: null },

    }
    , { timestamps: true }
);

export default mongoose.model("Fine", FineSchema);