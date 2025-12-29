"use client";
import { useEffect, useState } from "react";
import Header from "@/component/header";
import Slider from "@/component/slider";
import MainContent from "@/component/content";
import { Books, GetBooksResponse } from "@/type/book";
import { getListBooks } from "@/service/books/getListBooks";

export default function HomePage() {
  const [books, setBooks] = useState<Books[]>([]);
  const [books2, setBooks2] = useState<GetBooksResponse | null>(null);
  const [images, setImages] = useState<string[]>([]);
  
  // ✨ THÊM STATE PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  // ✨ SỬA HÀM FETCH
  const fetchBooks = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await getListBooks({ page, limit });
      setBooks2(data ?? null);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage, limit]);

  // ✨ HÀM XỬ LÝ CHUYỂN TRANG
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getAllFantasy = async () => {
    const all = [];
    const totalPages = 3;
    for (let page = 1; page <= totalPages; page++) {
      const res = await fetch(
        `https://openlibrary.org/subjects/fantasy.json?limit=100&offset=${
          (page - 1) * 100
        }`
      );
      const data = await res.json();
      all.push(...data.works);
    }
    setBooks(all);
    const covers = all
      .filter((b) => b.cover_id)
      .slice(0, 10)
      .map((b) => `https://covers.openlibrary.org/b/id/${b.cover_id}-L.jpg`);
    setImages(covers);
  };

  useEffect(() => {
    getAllFantasy();
  }, []);

  return (
    <>
      <Slider images={images} autoplay interval={4000} />
      <MainContent 
        books={books2} 
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </>
  );
}