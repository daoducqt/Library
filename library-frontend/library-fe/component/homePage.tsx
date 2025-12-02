"use client";
import { useEffect, useState } from "react";
import Header from "@/component/header";
import Slider from "@/component/slider";
import MainContent from "@/component/content";
import { Books } from "@/type/book";
import { getListBooks } from "@/service/books/getListBooks";

export default function HomePage() {
  const [books, setBooks] = useState<Books[]>([]);
  const [books2, setBooks2] = useState<Books[] | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    getListBooks().then((data) => {
      setBooks2(data ?? null); // nếu undefined → gán null
    });
  }, []);
  console.log(books2, "books2");
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
  console.log(books, "books");
  return (
    <>
      {/* <Header /> */}
      <Slider images={images} autoplay interval={4000} />
      <MainContent books={books2} />
    </>
  );
}
