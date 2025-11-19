import Book from "../models/Book.js";
import axios from "axios";

const excecute = async (req, res) => {
    try {
        let { subject } = req.query;
        if(!subject){
            return res.status(400).send({
                status: 400,
                message: "subject is required",
            });
        }
        subject = subject.trim().toLowerCase();
        
        // kiểm tra DB: tìm theo trường `subjects` (lưu subject đã tìm)
        const booksInDb = await Book.find({ subjects: subject });

        if (booksInDb.length > 0) {
            return res.json({
                source: "database",
                total: booksInDb.length,
                data: booksInDb,
            });
        }

        // curl -v "http://localhost:3003/book/importBooks?subject=fantasy"
        // thay subject = "fantasy" bằng những subject bạn muốn tìm kiếm sách từ Open Library
        // Call Open Library API
        const url = `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=50`;
        const response = await axios.get(url);
        const works = response.data?.works || [];

        if (works.length === 0) {
            return res.status(404).send({ message: "Không tìm thấy dữ liệu từ API" });
        }

        // Map dữ liệu từ Open Library sang định dạng của Book model
        const formattedBooks = works.map((item) => ({
            title: item.title,
            author: item.authors?.[0]?.name || "Unknown",
            coverId: item.cover_id || null,
            subject,
        }));

        // Lưu vào database (insertMany). Consider using upsert or checking duplicates in production.
        await Book.insertMany(formattedBooks);

        return res.json({
            source: "openlibrary",
            total: formattedBooks.length,
            data: formattedBooks,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            status: 500,
            message: "Lỗi máy chủ nội bộ",
        });
    }
};

export default { excecute };