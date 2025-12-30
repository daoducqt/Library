import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    bookId: {   
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "NOTIFIED", "CANCELLED"],
        default: "PENDING",
    },
    notifiedAt: Date,
    note: String,
}, {
    timestamps: true,
});

WishlistSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default mongoose.model("Wishlist", WishlistSchema);