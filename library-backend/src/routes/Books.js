const router = require("express").Router();
const { getBooks, createBook } = require("../controllers/bookController");

// GET tất cả sách
router.get("/", getBooks);

// POST tạo sách mới
router.post("/", createBook);

module.exports = router;