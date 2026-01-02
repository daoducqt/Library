"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getBorrowedBooks } from "@/service/loan/getBorrowedBooks";
import { BorrowedBook } from "@/type/book";

export default function BorrowedBooksPage() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    setLoading(true);
    try {
      const response = await getBorrowedBooks();
      if (response && response.data) {
        setBorrowedBooks(response.data);
      }
    } catch (error) {
      console.error("Error loading borrowed books:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = borrowedBooks.filter(
    (book) => filterStatus === "all" || book.status === filterStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
            Chờ xác nhận
          </span>
        );
      case "BORROWED":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            Đang mượn
          </span>
        );
      case "OVERDUE":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            Quá hạn
          </span>
        );
      case "RETURNED":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Đã trả
          </span>
        );
      default:
        return null;
    }
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <svg
                  className="w-9 h-9 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Sách đã mượn
              </h1>
              <p className="text-gray-600 mt-2">
                Bạn đang có{" "}
                <span className="font-bold text-blue-600">
                  {borrowedBooks.length}
                </span>{" "}
                cuốn sách trong danh sách mượn
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchBorrowedBooks}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="font-semibold text-gray-700">Trạng thái:</span>
            <div className="flex flex-wrap gap-2">
              {["all", "PENDING", "BORROWED", "OVERDUE", "RETURNED"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      filterStatus === status
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status === "all"
                      ? "Tất cả"
                      : status === "PENDING"
                      ? "Chờ xác nhận"
                      : status === "BORROWED"
                      ? "Đang mượn"
                      : status === "OVERDUE"
                      ? "Quá hạn"
                      : "Đã trả"}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Books List */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">
              Không có sách nào
            </h3>
            <p className="mt-2 text-gray-500">
              Bạn chưa mượn sách nào hoặc không có sách với trạng thái này
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md"
            >
              Khám phá thư viện
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBooks.map((loan) => {
              const daysRemaining = calculateDaysRemaining(loan.dueDate);
              const isOverdue = daysRemaining < 0;
              const isNearDue = daysRemaining >= 0 && daysRemaining <= 3;

              return (
                <div
                  key={loan._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <div className="flex gap-6">
                      {/* Book Cover */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-44 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-md overflow-hidden">
                          {loan.book.coverUrl ? (
                            <img
                              src={loan.book.coverUrl}
                              alt={loan.book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-16 h-16 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {loan.book.title}
                            </h3>
                            <p className="text-gray-600">
                              Tác giả: {loan.book.author}
                            </p>
                          </div>
                          {getStatusBadge(loan.status)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <svg
                              className="w-5 h-5 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <div>
                              <p className="text-gray-500 text-xs">Ngày mượn</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(loan.borrowDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <svg
                              className="w-5 h-5 text-orange-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div>
                              <p className="text-gray-500 text-xs">Hạn trả</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(loan.dueDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <svg
                              className={`w-5 h-5 ${
                                isOverdue
                                  ? "text-red-500"
                                  : isNearDue
                                  ? "text-yellow-500"
                                  : "text-green-500"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            <div>
                              <p className="text-gray-500 text-xs">Còn lại</p>
                              <p
                                className={`font-bold ${
                                  isOverdue
                                    ? "text-red-600"
                                    : isNearDue
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                }`}
                              >
                                {isOverdue
                                  ? `Quá ${Math.abs(daysRemaining)} ngày`
                                  : `${daysRemaining} ngày`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <svg
                              className="w-5 h-5 text-purple-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            <div>
                              <p className="text-gray-500 text-xs">Gia hạn</p>
                              <p className="font-medium text-gray-900">
                                {loan.extendCount} lần
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {loan.status === "BORROWED" && (
                          <div className="flex gap-3 mt-4">
                            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-md flex items-center justify-center gap-2">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                              Trả sách
                            </button>
                            <button
                              disabled={loan.extendCount >= 3}
                              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-2 ${
                                loan.extendCount >= 3
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                              }`}
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Gia hạn
                            </button>
                          </div>
                        )}

                        {isOverdue && loan.status === "BORROWED" && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">
                              ⚠️ Sách đã quá hạn! Vui lòng trả sách sớm nhất có
                              thể để tránh phạt.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
