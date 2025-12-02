import Book from "../models/Book.js";
import Category from "../../category/model/category.js";
import axios from "axios";
import { categoryNameMap } from "../../category/controller/Map.js";
import slugify from "slugify";

const excecute = async (req, res) => {
    try {
        let { subject } = req.query;
        if (!subject) {
            return res.status(400).send({
                status: 400,
                message: "subject is required",
            });
        }
        subject = subject.trim().toLowerCase();

        // --- Tạo hoặc lấy category theo subject ---
        subject = subject.trim().toLowerCase();
        const subjectClean = subject.replace(/^=+/, ""); // loại bỏ dấu = nếu có
        const subjectSlug = slugify(subjectClean, { lower: true, locale: "vi", remove: /[*+~.()'"!:@]/g });

        let category = await Category.findOne({ slug: subjectSlug });
        if (!category) {
        category = await Category.create({
            name: subjectClean,  // bỏ dấu =
            slug: subjectSlug,
            viName: categoryNameMap[subjectClean] || subjectClean
        });
    }


        // Lấy sách từ Open Library
        const url = `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=50`;
        const response = await axios.get(url);
        const works = response.data?.works || [];

        if (works.length === 0) {
            return res.status(404).send({ message: "Không tìm thấy dữ liệu từ API" });
        }

        // Map dữ liệu sang định dạng Book
        const bulkOps = works.map((item) => {
            const itemSubjects = [];

            if (Array.isArray(item.subjects)) {
                itemSubjects.push(...item.subjects.map(sub => sub.toLowerCase()));
            }
            if (Array.isArray(item.subject)) {
                itemSubjects.push(...item.subject.map(sub => sub.toLowerCase()));
            }
            if (!itemSubjects.includes(subject)) {
                itemSubjects.push(subject);
            }

            const bookData = {
                title: item.title,
                author: item.authors?.[0]?.name || "Unknown",
                description: item.description ? (typeof item.description === 'string' ? item.description : item.description.value) : "No description available",
                publishedYear: item.first_publish_year || null,
                coverId: item.cover_id || null,
                subjects: itemSubjects,
                categoryId: category._id,
            };

            return {
                updateOne: {
                    filter: { title: bookData.title, author: bookData.author },
                    update: { $set: bookData },
                    upsert: true,
                }
            };
        });

        // Bulk upsert tất cả sách
        const bulkResult = await Book.bulkWrite(bulkOps);

        return res.json({
            source: "openlibrary",
            total: works.length,
            upsertedCount: bulkResult.upsertedCount,
            modifiedCount: bulkResult.modifiedCount,
            data: works.map(w => w.title),
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
