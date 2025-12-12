import mongoose from "mongoose";

const { Schema, model } = mongoose;

const BookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: String,
    description: String,
    publishedYear: Number,
    // genre: String,

    totalCopies: { type: Number, default: 1, min: 0},
    availableCopies: { type: Number, default: 1, min: 0},

    available: { type: Boolean, default: true },

    // dùng để lưu sách từ Open Library
    subjects: [{ type: String, index: true }], // lưu nhiều subject liên quan đến sách
    coverId : Number,

    // lượt xem và chương sách
    views: { type: Number, default: 0 },

    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },

    openLibraryId: { type: String, index: true, unique: true, sparse: true }, // id của Open Library

    editionKeys:  [{ type: String, index: true }], // lưu các edition keys 
  }, 
  { timestamps: true }
);

BookSchema.pre("save", function (next) {
  this.available = this.availableCopies > 0;
  next();
});

export default model("Book", BookSchema);