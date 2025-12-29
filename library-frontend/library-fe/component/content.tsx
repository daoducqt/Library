"use client";

import { Author, Books, GetBooksResponse } from "@/type/book";
import React from "react";
import { useRouter } from "next/navigation";

/* ──────────────────────  Types  ────────────────────── */
interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
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
  reads: string;
}

type BookItem = Book | RankedBook;

const isRanked = (item: BookItem): item is RankedBook => "rank" in item;

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
  books: GetBooksResponse | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

/* ──────────────────────  Component  ────────────────────── */
export default function MainContent({
  books,
  currentPage,
  onPageChange,
  isLoading = false,
}: MainContentProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = React.useState<string>("all");

  const filterTabs = [
    { key: "all", label: "Tất cả", icon: "📚" },
    { key: "public", label: "Công khai", icon: "🔓" },
    { key: "restricted", label: "Hạn chế", icon: "🔒" },
  ];

  const handleBookClick = (bookId: string) => {
    router.push(`/detail/${bookId}`);
  };

  // Lấy tất cả sách (không giới hạn 30)
  const filteredBooks = React.useMemo(() => {
    const allBooks = books?.data || [];
    if (activeFilter === "all") return allBooks;
    if (activeFilter === "public")
      return allBooks.filter((b: Books) => b.public_scan);
    return allBooks.filter((b: Books) => !b.public_scan);
  }, [activeFilter, books?.data]);

  // Lấy thông tin phân trang
  const totalPages = books?.pagination?.totalPages || 1;
  const totalBooks = books?.pagination?.total || 0;
  const currentPageNum = books?.pagination?.page || currentPage;

  // Tạo mảng số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Nếu tổng số trang <= 5, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Nếu tổng số trang > 5, hiển thị thông minh
      if (currentPageNum <= 3) {
        // Ở đầu
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPageNum >= totalPages - 2) {
        // Ở cuối
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ở giữa
        for (let i = currentPageNum - 2; i <= currentPageNum + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  return (
    <main className="min-h-screen bg-black text-white py-8 relative overflow-hidden">
      {/* Animated background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>

      {/* Floating magical particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-gray-500 rounded-full animate-float-particle opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${20 + Math.random() * 15}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEwMCwgMTAwLCAxMDAsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-800/10 rounded-full blur-3xl animate-blob-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-700/10 rounded-full blur-3xl animate-blob-slow animation-delay-8000"></div>

      {/* Floating books */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute text-5xl opacity-5 animate-float-book-slow"
            style={{
              left: `${25 + i * 25}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 5}s`,
            }}
          >
            📖
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes blob-slow {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(10px, -15px) scale(1.05);
          }
          66% {
            transform: translate(-10px, 10px) scale(0.95);
          }
        }

        @keyframes float-particle {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          25% {
            opacity: 0.2;
          }
          50% {
            transform: translateY(-80px) translateX(30px);
            opacity: 0.2;
          }
          75% {
            opacity: 0.2;
          }
        }

        @keyframes float-book-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
          }
        }

        .animate-blob-slow {
          animation: blob-slow 20s ease-in-out infinite;
        }

        .animation-delay-8000 {
          animation-delay: 8s;
        }

        .animate-float-particle {
          animation: float-particle 25s ease-in-out infinite;
        }

        .animate-float-book-slow {
          animation: float-book-slow 30s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-full mx-auto px-8 relative z-10">
        <div className="flex gap-6">
          {/* Left: main grid */}
          <div className="flex-1 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Decorative top border */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

            {/* Tabs / Filters */}
            <div className="bg-black/40 border-b border-gray-800 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFilter(tab.key)}
                      className={`relative py-3 px-4 text-base font-bold transition-all duration-300 ${
                        activeFilter === tab.key
                          ? "text-gray-200 scale-105"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{tab.icon}</span>
                        {tab.label}
                      </span>
                      {activeFilter === tab.key && (
                        <>
                          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600 rounded-t-full"></div>
                          <div className="absolute inset-0 bg-gray-700/10 rounded-lg -z-10"></div>
                        </>
                      )}
                    </button>
                  ))}
                </div>

                {/* Thông tin tổng số sách */}
                <div className="text-sm text-gray-400">
                  Tổng:{" "}
                  <span className="font-bold text-gray-300">{totalBooks}</span>{" "}
                  sách
                </div>
              </div>
            </div>

            {/* Grid cards */}
            <div className="p-8 min-h-[600px] relative">
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 font-semibold">Đang tải...</p>
                  </div>
                </div>
              )}

              {/* Book grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredBooks?.map((book: Books, index: number) => (
                  <div
                    key={book.ia || index}
                    onClick={() => handleBookClick(book._id)}
                    className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-gray-600 hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative"
                  >
                    {/* Gothic corner decorations */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-gray-700/50"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-gray-700/50"></div>

                    {/* Cover image with overlay */}
                    <div className="relative w-full aspect-[2/3] bg-cover bg-center overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{
                          backgroundImage: `url(${
                            book.coverUrl ||
                            "https://via.placeholder.com/300x450?text=No+Cover"
                          })`,
                        }}
                      ></div>
                      {/* Dark vignette overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50"></div>

                      {/* Subtle glow on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-600/0 via-gray-600/0 to-gray-600/0 group-hover:from-gray-600/10 group-hover:via-gray-600/5 transition-all duration-500"></div>
                    </div>

                    {/* Info below image */}
                    <div className="p-3 bg-gradient-to-b from-gray-900 to-black">
                      <h3 className="text-[12px] font-bold line-clamp-2 text-gray-300 group-hover:text-gray-100 transition-colors">
                        {book.title}
                      </h3>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                        <span className="line-clamp-1">
                          {book.authors
                            ?.map((author: Author) => author.name)
                            .join(", ") || "Không rõ"}
                        </span>
                        <span className="text-gray-400 font-semibold">
                          {book.first_publish_year}
                        </span>
                      </div>

                      {/* Availability badge */}
                      {book.availability?.status && (
                        <div
                          className={`mt-2 inline-block text-[10px] px-3 py-1 rounded-full font-bold border ${
                            book.availability?.status === "open"
                              ? "bg-gray-800/60 text-gray-300 border-gray-700"
                              : "bg-gray-900/60 text-gray-400 border-gray-800"
                          }`}
                        >
                          {book.availability?.status === "open"
                            ? "📖 Đọc online"
                            : "🔐 Mượn"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && !isLoading && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  {/* Previous button */}
                  <button
                    onClick={() => onPageChange(currentPageNum - 1)}
                    disabled={currentPageNum === 1}
                    className="px-5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                  >
                    ← Trước
                  </button>

                  {/* First page + ellipsis */}
                  {currentPageNum > 3 && totalPages > 5 && (
                    <>
                      <button
                        onClick={() => onPageChange(1)}
                        className="w-11 h-11 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-600 transition-all font-bold"
                      >
                        1
                      </button>
                      <span className="text-gray-600 font-bold">...</span>
                    </>
                  )}

                  {/* Page numbers */}
                  <div className="flex gap-2">
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`w-11 h-11 rounded-lg font-bold transition-all ${
                          currentPageNum === pageNum
                            ? "bg-gradient-to-br from-gray-600 to-gray-700 text-white scale-110 shadow-lg border-2 border-gray-500"
                            : "bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-600 hover:text-gray-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Last page + ellipsis */}
                  {currentPageNum < totalPages - 2 && totalPages > 5 && (
                    <>
                      <span className="text-gray-600 font-bold">...</span>
                      <button
                        onClick={() => onPageChange(totalPages)}
                        className="w-11 h-11 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-600 transition-all font-bold"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  {/* Next button */}
                  <button
                    onClick={() => onPageChange(currentPageNum + 1)}
                    disabled={currentPageNum === totalPages}
                    className="px-5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                  >
                    Sau →
                  </button>
                </div>
              )}

              {/* Page info */}
              {totalPages > 1 && !isLoading && (
                <div className="mt-6 text-center text-sm text-gray-500">
                  Trang{" "}
                  <span className="font-bold text-gray-400">
                    {currentPageNum}
                  </span>{" "}
                  /{" "}
                  <span className="font-bold text-gray-400">{totalPages}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: ranked sidebar */}
          <aside className="w-100 flex-shrink-0">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl overflow-hidden sticky top-6">
              {/* Decorative top border */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

              {/* Header */}
              <div className="bg-black/40 p-5 border-b border-gray-800 relative">
                <h3 className="text-lg font-bold flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .587l3.668 7.431L23.5 9.75l-5.5 5.36L19.335 24 12 20.017 4.665 24l1.335-8.89L.5 9.75l7.832-1.732L12 .587z" />
                  </svg>
                  <span className="text-gray-200">Đọc nhiều nhất</span>
                </h3>
              </div>

              {/* Content */}
              <div className="bg-gradient-to-b from-gray-900 to-black p-5">
                <div className="space-y-4">
                  {rankedRow.items.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-800/40 border border-transparent hover:border-gray-700 transition-all duration-300 cursor-pointer group"
                    >
                      {/* rank circle */}
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
                            book.rank === 1
                              ? "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-black"
                              : book.rank === 2
                              ? "bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 text-white"
                              : "bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 text-white"
                          }`}
                        >
                          {book.rank}
                        </div>
                      </div>

                      {/* thumbnail */}
                      <div className="relative">
                        <div
                          className="w-14 h-20 bg-cover bg-center rounded-lg overflow-hidden shadow-xl border border-gray-800 group-hover:border-gray-600 transition-colors"
                          style={{ backgroundImage: `url(${book.coverUrl})` }}
                        />
                      </div>

                      {/* text */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold line-clamp-2 text-gray-300 group-hover:text-gray-100">
                          {book.title}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2">
                          <span className="line-clamp-1">{book.author}</span>
                          <span className="flex items-center gap-1 text-gray-400 font-semibold">
                            📖 {book.reads}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom decorative border */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
