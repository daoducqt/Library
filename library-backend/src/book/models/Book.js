import mongoose from "mongoose";

const { Schema, model } = mongoose;

const BookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: String,
    description: String,
    publishedYear: Number,
    genre: String,
    available: { type: Boolean, default: true },

    // dùng để lưu sách từ Open Library
    subjects: [{ type: String, index: true }], // lưu nhiều subject liên quan đến sách
    coverId : Number,

  }, 
  { timestamps: true }
);

export default model("Book", BookSchema);