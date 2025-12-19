import mongoose from "mongoose";

export const StockTypeEnum = {
    STOCK_IN: "STOCK_IN",
    STOCK_OUT: "STOCK_OUT",
};

const StockInSchema = new mongoose.Schema(
    {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
        quantity: { type: Number, required: true, min: 1 },
        type: { type: String, enum: Object.values(StockTypeEnum), required: true },
        note: { type: String, default: "" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);
    
export default mongoose.model("StockIn", StockInSchema);