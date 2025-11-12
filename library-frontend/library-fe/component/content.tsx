"use client";

import { Books } from "@/type/book";
import React from "react";

/* ──────────────────────  Types  ────────────────────── */
interface Book {
  id: string; // "/works/OL138052W"
  title: string;
  author: string;
  coverUrl: string; // từ cover_id
  publishYear?: number;
  editionCount?: number;
  subjects?: string[];
  availabilityStatus?: string;
  hasFullText?: boolean;
  isPublic?: boolean;
  collection?: string[];
  lendingInfo?: {
    edition: string;
    identifier: string;
  };
}

interface RankedBook extends Book {
  rank: number;
  reads: string; // thay cho views
}

type BookItem = Book | RankedBook;

const isRanked = (item: BookItem): item is RankedBook => "rank" in item;

/* ──────────────────────  Fake data (Book style)  ────────────────────── */
const allBookItems: BookItem[] = [
  {
    id: "/works/OL138052W",
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    coverUrl: "https://covers.openlibrary.org/b/id/10527843-L.jpg",
    publishYear: 1865,
    editionCount: 3546,
    subjects: ["Fantasy", "Adventure", "Children's literature"],
    availabilityStatus: "open",
    hasFullText: true,
    isPublic: true,
    collection: ["Boston College Library", "americana"],
    lendingInfo: {
      edition: "OL45637056M",
      identifier: "alicesadventures0000unse_v7d2",
    },
  },
  {
    id: "/works/OL45804W",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    publishYear: 1813,
    editionCount: 2900,
    subjects: ["Romance", "Classic", "Society"],
    availabilityStatus: "open",
    hasFullText: true,
    isPublic: true,
  },
  {
    id: "/works/OL82563W",
    title: "Moby-Dick; or, The Whale",
    author: "Herman Melville",
    coverUrl: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
    publishYear: 1851,
    editionCount: 2100,
    subjects: ["Adventure", "Sea stories"],
    availabilityStatus: "open",
    hasFullText: true,
    isPublic: true,
  },
  {
    id: "/works/OL44573W",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverUrl: "https://covers.openlibrary.org/b/id/7222243-L.jpg",
    publishYear: 1925,
    editionCount: 1250,
    subjects: ["Classic", "Drama", "Society"],
    availabilityStatus: "restricted",
    hasFullText: false,
    isPublic: false,
  },
];

/* ──────────────────────  Ranked (Most Read)  ────────────────────── */
const rankedRow = {
  title: "Đọc nhiều nhất",
  isRanked: true,
  items: [
    {
      id: "/works/OL138052W",
      rank: 1,
      title: "Alice's Adventures in Wonderland",
      author: "Lewis Carroll",
      coverUrl: "https://covers.openlibrary.org/b/id/10527843-L.jpg",
      publishYear: 1865,
      reads: "1.2M",
    },
    {
      id: "/works/OL15669W",
      rank: 2,
      title: "1984",
      author: "George Orwell",
      coverUrl: "https://covers.openlibrary.org/b/id/7222245-L.jpg",
      publishYear: 1949,
      reads: "980K",
    },
    {
      id: "/works/OL45804W",
      rank: 3,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      coverUrl: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
      publishYear: 1813,
      reads: "850K",
    },
  ] as RankedBook[],
};
type MainContentProps = {
  books: Books[];
};
/* ──────────────────────  Component  ────────────────────── */
export default function MainContent({ books }: MainContentProps) {
  const [activeFilter, setActiveFilter] = React.useState<string>("all");

  const filterTabs = [
    { key: "all", label: "Tất cả" },
    { key: "public", label: "Công khai" },
    { key: "restricted", label: "Hạn chế" },
  ];

  const limitedBooks = React.useMemo(() => books.slice(0, 30), [books]);
  // ✅ Lọc theo tab
  const filteredBooks = React.useMemo(() => {
    if (activeFilter === "all") return limitedBooks;
    if (activeFilter === "public")
      return limitedBooks.filter((b) => b.public_scan);
    return limitedBooks.filter((b) => !b.public_scan);
  }, [activeFilter, limitedBooks]);

  return (
    <main className="min-h-screen bg-[#1a1c23] text-white py-6">
      <div className="max-w-full mx-auto px-8">
        <div className="flex gap-4">
          {/* Left: main grid */}
          <div className="flex-1 bg-[#1e2026] border border-[#36383f] rounded-xl shadow-inner overflow-hidden">
            {/* Tabs / Filters */}
            <div className="bg-[#23252c] border-b border-[#36383f] p-4">
              <div className="flex items-center gap-8">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`relative py-2 text-base font-medium transition-colors ${
                      activeFilter === tab.key
                        ? "text-sky-400 font-bold"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                    {activeFilter === tab.key && (
                      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-sky-400 rounded-t-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid cards */}
            <div className="p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredBooks.map((book) => (
                  <div
                    key={book.ia}
                    className="group bg-[#25272e] border border-[#36383f] rounded-lg overflow-hidden shadow-md hover:shadow-lg hover:border-sky-500 hover:scale-[1.03] transition-all duration-300 cursor-pointer"
                  >
                    {/* Cover image */}
                    <div
                      className="relative w-full aspect-[2/3] bg-cover bg-center"
                      style={{
                        backgroundImage: `url(https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg)`,
                      }}
                    ></div>

                    {/* Info below image */}
                    <div className="p-2">
                      <h3 className="text-[12px] font-semibold line-clamp-2 text-white group-hover:text-sky-400 transition-colors">
                        {book.title}
                      </h3>

                      <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="line-clamp-1">
                          {book.authors
                            ?.map((author) => author.name)
                            .join(", ") || "Không rõ"}
                        </span>
                        <span>{book.first_publish_year}</span>
                      </div>

                      {/* Availability badge */}
                      {book.availability?.status && (
                        <div
                          className={`mt-2 inline-block text-[10px] px-2 py-[2px] rounded font-semibold ${
                            book.availability?.status === "open"
                              ? "bg-green-600/20 text-green-400"
                              : "bg-red-600/20 text-red-400"
                          }`}
                        >
                          {book.availability?.status === "open"
                            ? "Đọc online"
                            : "Mượn"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: ranked sidebar */}
          <aside className="w-100 flex-shrink-0">
            <div className="bg-[#1e2026] border border-[#36383f] rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#25272e] to-[#292b32] p-4 border-b border-[#36383f]">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .587l3.668 7.431L23.5 9.75l-5.5 5.36L19.335 24 12 20.017 4.665 24l1.335-8.89L.5 9.75l7.832-1.732L12 .587z" />
                  </svg>
                  Đọc nhiều nhất
                </h3>
              </div>

              {/* Content */}
              <div className="bg-[#1e2026] p-4">
                <div className="space-y-3">
                  {rankedRow.items.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center gap-4  hover:bg-[#2a2c34] transition-colors"
                    >
                      {/* rank circle */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          book.rank === 1
                            ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-black"
                            : book.rank === 2
                            ? "bg-slate-300 text-black"
                            : "bg-gray-700 text-white"
                        }`}
                      >
                        {book.rank}
                      </div>

                      {/* thumbnail */}
                      <div
                        className="w-12 h-16 bg-cover bg-center rounded overflow-hidden flex-shrink-0"
                        style={{ backgroundImage: `url(${book.coverUrl})` }}
                      />

                      {/* text */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold line-clamp-2">
                          {book.title}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                          <span className="line-clamp-1">{book.author}</span>
                          <span className="flex items-center gap-1">
                            📖 {book.reads}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
