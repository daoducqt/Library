const Book = require("../models/Book");

// Lấy tất cả sách
const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo sách mới
const createBook = async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    console.log("Book saved:", savedBook);
    res.json(savedBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getBooks,
  createBook
};