const mongoose = require("mongoose");
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

module.exports = model("Book", BookSchema);