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
  }, 
  { timestamps: true }
);

export default model("Book", BookSchema);