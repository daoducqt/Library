"use client";
import { useEffect, useState } from "react";
import Slider from "@/component/slider";
import MainContent from "@/component/content";
import { Books, GetBooksResponse } from "@/type/book";
import { getListBooks } from "@/service/books/getListBooks";

export default function HomePage() {
  const [books, setBooks] = useState<Books[]>([]);
  const [books2, setBooks2] = useState<GetBooksResponse | null>(null);
  const [images] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBooks = async (page: number, search: string = "") => {
    setIsLoading(true);
    try {
      const data = await getListBooks({ page, limit, search });
      setBooks2(data ?? null);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(currentPage, searchTerm);
  }, [currentPage, limit, searchTerm]);

  // ✨ LẮNG NGHE EVENT TỪ HEADER
  useEffect(() => {
    const handleHeaderSearch = (event: CustomEvent) => {
      const query = event.detail.query;
      setSearchTerm(query);
      setCurrentPage(1); // Reset về trang 1 khi search
    };

    window.addEventListener(
      "header-search",
      handleHeaderSearch as EventListener
    );

    return () => {
      window.removeEventListener(
        "header-search",
        handleHeaderSearch as EventListener
      );
    };
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  console.log(books2, "books2");
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
