import Book from "../models/Book.js";
import Category from "../../category/model/category.js";
import axios from "axios";
import { categoryNameMap } from "../../category/controller/Map.js";
import slugify from "slugify";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// fetch detail với retry/backoff và header User-Agent
async function fetchWorkDetailWithRetry(workKey, retries = 3) {
  const url = `https://openlibrary.org${workKey}.json`;
  const axiosConfig = {
    timeout: 10000,
    headers: {
      "User-Agent": "Library-Importer/1.0 (contact@yourdomain.com)",
      Accept: "application/json",
    },
    validateStatus: null,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await axios.get(url, axiosConfig);

      if (resp.status === 200) return resp.data;
      if (resp.status === 404) return null;
      if (resp.status === 429 || resp.status >= 500) throw new Error(`HTTP ${resp.status}`);
      return null;
    } catch (err) {
      if (attempt === retries) {
        console.log(`fetchWorkDetailWithRetry: give up ${workKey} after ${attempt} attempts -> ${err.message}`);
        return null;
      }
      await sleep(200 * Math.pow(2, attempt));
    }
  }
  return null;
}

// chunked enrichment: process works in chunks
async function enrichWorksWithDetailsChunked(works, chunkSize = 10, pauseMs = 150) {
  const results = [];
  for (let i = 0; i < works.length; i += chunkSize) {
    const chunk = works.slice(i, i + chunkSize);
    const promises = chunk.map(async (item) => {
      let description = null;
      if (item.key) {
        try {
          const detail = await fetchWorkDetailWithRetry(item.key, 3);
          if (detail) {
            if (detail.description) {
              description = typeof detail.description === "string" ? detail.description : detail.description.value || null;
            }
            if (!description && detail.first_sentence) {
              description = typeof detail.first_sentence === "string" ? detail.first_sentence : detail.first_sentence.value || null;
            }
            if (!description && Array.isArray(detail.excerpts) && detail.excerpts.length) {
              description = detail.excerpts[0].text || detail.excerpts[0].excerpt || null;
            }
            if (!description && detail.notes) {
              description = typeof detail.notes === "string" ? detail.notes : detail.notes.value || null;
            }
          }
        } catch (err) {
          console.log(`enrich chunk error for ${item.key}:`, err.message || err.toString());
        }
      }
      return { ...item, description };
    });

    const resolved = await Promise.all(promises);
    results.push(...resolved);

    if (i + chunkSize < works.length) {
      await sleep(pauseMs);
    }
  }
  return results;
}

const excecute = async (req, res) => {
  try {
    let { subject, title, limit = 50, offset = 0 } = req.query;

    if (!subject && !title) {
      return res.status(400).send({ status: 400, message: "subject or title is required" });
    }

    limit = parseInt(limit, 10) || 50;
    offset = parseInt(offset, 10) || 0;

    let category = null;
    let works = [];

    if (subject) {
      subject = subject.trim().toLowerCase();
      const subjectClean = subject.replace(/^=+/, "");
      const subjectSlug = slugify(subjectClean, { lower: true, locale: "vi", remove: /[*+~.()'"!:@]/g });

      category = await Category.findOne({ slug: subjectSlug });
      if (!category) {
        category = await Category.create({
          name: subjectClean,
          slug: subjectSlug,
          viName: categoryNameMap[subjectClean] || subjectClean,
        });
      }

      const url = `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=${limit}&offset=${offset}`;
      const response = await axios.get(url);
      works = response.data?.works || [];
    } else if (title) {
      title = title.trim();
      const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=${limit}&offset=${offset}`;
      const response = await axios.get(url);
      works = response.data?.docs || [];
    }

    if (!works.length) {
      return res.status(404).send({ message: "Không tìm thấy dữ liệu từ API" });
    }

    const worksdetail = await enrichWorksWithDetailsChunked(works, 10, 150);

    // Map sang định dạng Book và random copies, lưu từng edition
    const bulkOps = worksdetail.flatMap((item) => {
      const itemSubjects = [];
      if (Array.isArray(item.subjects)) itemSubjects.push(...item.subjects.map(s => s.toLowerCase()));
      if (Array.isArray(item.subject)) itemSubjects.push(...item.subject.map(s => s.toLowerCase()));
      if (subject && !itemSubjects.includes(subject)) itemSubjects.push(subject);

      const editionKeys = item.edition_key || [];
      if (!editionKeys.length) editionKeys.push(item.key?.replace(/^\/works\//, ""));

      const totalCopies = Math.floor(Math.random() * 6) + 5;

      return editionKeys.map((ek) => {
        const availableCopies = Math.floor(Math.random() * (totalCopies + 1));
        const available = availableCopies > 0;

        const bookData = {
          title: item.title,
          author: item.authors?.[0]?.name || item.author_name?.[0] || "Unknown",
          description: item.description || item.first_sentence || "No description available",
          publishedYear: item.first_publish_year || item.first_publish_year,
          coverId: item.cover_id || null,
          subjects: itemSubjects,
          categoryId: category ? category._id : null,
          openLibraryId: item.key?.replace(/^\/works\//, "") || null,
          editionKeys: editionKeys,
          totalCopies,
          availableCopies,
          available,
          lendingIdentifier:  Array.isArray(item.ia) ? item.ia[0] : (item.ia || null), 
          isbn: item.isbn || [], 
        };

        return {
          updateOne: {
            filter: { editionKeys: ek },
            update: { $set: bookData },
            upsert: true,
          }
        };
      });
    });

    const bulkResult = await Book.bulkWrite(bulkOps, { ordered: false });

    return res.json({
      source: "openlibrary",
      requested: { subject, title, limit, offset },
      totalFetched: works.length,
      upsertedCount: bulkResult.upsertedCount,
      modifiedCount: bulkResult.modifiedCount,
      sampleTitles: works.slice(0, 20).map((w) => w.title),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ status: 500, message: "Lỗi máy chủ nội bộ" });
  }
};

export default { excecute };