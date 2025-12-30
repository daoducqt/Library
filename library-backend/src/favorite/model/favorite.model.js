import mongoose from "mongoose";
;

const FavoriteSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    bookId: { 
      type: Schema.Types.ObjectId, 
      ref: "Book", 
      required: true,
      index: true 
    },
  },
  { timestamps: true }
);

// 1 user chỉ favorite 1 book 1 lần
FavoriteSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default model("Favorite", FavoriteSchema);