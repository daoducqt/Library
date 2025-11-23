import mongoose from "mongoose";

const { Schema, model } = mongoose;

// const ChapterShema = new Schema(
//   {
//     title: { type: String, required: true },
//     content: { type: String, required: true },
//     order: { type: Number, required: true },
//   });

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

    // lượt xem và chương sách
    views: { type: Number, default: 0 },
    // chapters: [ChapterShema],

  }, 
  { timestamps: true }
);

export default model("Book", BookSchema);