"use client";
import { getDetails } from "@/service/books/getDetail";
import { borrowBooks } from "@/service/books/borrowBooks";
import React, { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface Author {
  key: string;
  name: string;
}

interface BookDetails {
  coverUrl: string;
  title: string;
  authors: Author[];
  first_publish_year: number;
  number_of_pages_median: number;
  subjects: string[];
  publishers: string[];
  isbn: string[];
  cover_id: number;
  description: string;
  language: string[];
  type: "borrow" | "online";
  availableCopies: number;
}

interface Comment {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface RecommendBook {
  title: string;
  cover_id: number;
  rating: number;
}

interface BookDetailsProps {
  slug: string;
}

const BookDetailsPage: React.FC<BookDetailsProps> = ({ slug }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [books, setBooks] = useState<BookDetails | undefined>(undefined);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [borrowDays, setBorrowDays] = useState(7);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const comments: Comment[] = [
    {
      id: 1,
      user: "Sarah Johnson",
      avatar: "👩",
      rating: 5,
      comment:
        "A timeless classic! The imagination and creativity in this book is simply wonderful. My children and I read it together every year.",
      date: "2024-11-10",
    },
    {
      id: 2,
      user: "Michael Chen",
      avatar: "👨",
      rating: 4,
      comment:
        "Fantastic story with deep philosophical undertones. Carroll's wordplay is brilliant!",
      date: "2024-11-08",
    },
    {
      id: 3,
      user: "Emma Davis",
      avatar: "👧",
      rating: 5,
      comment:
        "One of my favorite books since childhood. The illustrations in this edition are gorgeous!",
      date: "2024-11-05",
    },
  ];

  const recommendedBooks: RecommendBook[] = [
    {
      title: "Through the Looking-Glass",
      cover_id: 8235024,
      rating: 4.5,
    },
    {
      title: "The Wonderful Wizard of Oz",
      cover_id: 8456691,
      rating: 4.7,
    },
    {
      title: "Peter Pan",
      cover_id: 8313462,
      rating: 4.6,
    },
    {
      title: "The Chronicles of Narnia",
      cover_id: 8234166,
      rating: 4.8,
    },
  ];

  useEffect(() => {
    if (!slug) return;

    getDetails(slug).then((res) => {
      setBooks(res);
    });
  }, [slug]);

  console.log(books, "book details");

  const handleBorrowClick = () => {
    setShowBorrowModal(true);
  };

  const handleBorrowConfirm = async () => {
    if (!slug || !books) return;

    setIsBorrowing(true);
    try {
      const response = await borrowBooks(slug, borrowDays);

      if (response?.data) {
        setShowBorrowModal(false);
        setShowSuccessModal(true);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;

      alert(err.response?.data?.message || "Có lỗi xảy ra khi mượn sách");
      console.error("Borrow error:", err);
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleBorrowCancel = () => {
    setShowBorrowModal(false);
    setBorrowDays(7);
  };

  if (!books) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          color: "#ffd700",
          fontSize: "1.5rem",
        }}
      >
        ⏳ Đang tải...
      </div>
    );
  }
  console.log(books, "book details render");
  return (
    <>
      {/* Fantasy Background */}
      <div className="fantasy-background">
        <div className="stars">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="floating-books">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="floating-book"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${20 + Math.random() * 30}px`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}
            >
              📚
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "60px 20px",
          position: "relative",
        }}
      >
        {/* Top Section: Book Info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "40px",
            marginBottom: "50px",
          }}
        >
          {/* Book Cover */}
          <div
            className={`book-cover-container ${
              isVisible ? "fade-in-left" : ""
            }`}
            style={{
              opacity: isVisible ? 1 : 0,
              animationDelay: "0.2s",
            }}
          >
            <img
              src={books.coverUrl}
              alt={books.title}
              style={{
                width: "100%",
                borderRadius: "15px",
                border: "3px solid rgba(138, 43, 226, 0.5)",
              }}
            />
          </div>

          {/* Book Details */}
          <div>
            <h1
              className={`title-text ${isVisible ? "fade-in-up" : ""}`}
              style={{
                fontSize: "2.5rem",
                marginBottom: "15px",
                opacity: isVisible ? 1 : 0,
                animationDelay: "0.4s",
                fontWeight: "bold",
                letterSpacing: "2px",
              }}
            >
              {books.title}
            </h1>

            <div
              className={`${isVisible ? "fade-in-up" : ""}`}
              style={{
                fontSize: "1.2rem",
                color: "#b8a6d9",
                marginBottom: "25px",
                opacity: isVisible ? 1 : 0,
                animationDelay: "0.6s",
                fontStyle: "italic",
              }}
            >
              {/* ✨ by {books.authors.map((author) => author.name).join(", ")} */}
            </div>

            {/* Action Button */}
            <div
              className={`${isVisible ? "fade-in-up" : ""}`}
              style={{
                marginBottom: "30px",
                opacity: isVisible ? 1 : 0,
                animationDelay: "0.8s",
              }}
            >
              <button
                className="magic-button"
                onClick={
                  books.availableCopies > 0 ? handleBorrowClick : undefined
                }
                style={{
                  padding: "15px 50px",
                  backgroundColor:
                    books.type === "online" ? "#1e88e5" : "#8a2be2",
                  color: "white",
                  border:
                    "2px solid " +
                    (books.type === "online" ? "#42a5f5" : "#9d4edd"),
                  borderRadius: "30px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                {books.type === "online" ? "📖 Đọc Online" : "📚 Thuê Sách"}
              </button>
            </div>

            {/* Genres/Subjects */}
            <div
              className={`${isVisible ? "fade-in-up" : ""}`}
              style={{
                marginBottom: "30px",
                opacity: isVisible ? 1 : 0,
                animationDelay: "1s",
              }}
            >
              <h3
                style={{
                  fontSize: "1.3rem",
                  marginBottom: "15px",
                  color: "#ffd700",
                }}
              >
                🏷️ Thể Loại
              </h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {books.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="tag fade-in-up"
                    style={{
                      padding: "8px 20px",
                      borderRadius: "25px",
                      fontSize: "0.95rem",
                      color: "#e6d5ff",
                      animationDelay: `${1 + index * 0.1}s`,
                    }}
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Overview & Recommendations */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "40px",
            marginBottom: "50px",
          }}
        >
          {/* Overview Section */}
          <div>
            <h2
              className={`${isVisible ? "fade-in-up" : ""}`}
              style={{
                fontSize: "2rem",
                color: "#ffd700",
                marginBottom: "25px",
                opacity: isVisible ? 1 : 0,
                animationDelay: "1.2s",
              }}
            >
              📋 Tổng Quan
            </h2>

            {/* Summary - Full Width */}
            <div
              className={`magic-card ${isVisible ? "fade-in-up" : ""}`}
              style={{
                padding: "30px",
                marginBottom: "25px",
                opacity: isVisible ? 1 : 0,
                animationDelay: "1.4s",
              }}
            >
              <h3
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "20px",
                  color: "#ffd700",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                ✨ Tóm Tắt Nội Dung
              </h3>
              <p
                style={{
                  lineHeight: "2",
                  color: "#d4c5f9",
                  fontSize: "1.1rem",
                  textAlign: "justify",
                }}
              >
                {books.description}
              </p>
            </div>

            {/* Two Columns: Author Info & Book Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "25px",
                marginBottom: "25px",
              }}
            >
              {/* Author Info */}
              <div
                className={`magic-card ${isVisible ? "fade-in-up" : ""}`}
                style={{
                  padding: "25px",
                  opacity: isVisible ? 1 : 0,
                  animationDelay: "1.6s",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.4rem",
                    marginBottom: "20px",
                    color: "#ffd700",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  ✍️ Thông Tin Tác Giả
                </h3>
                {/* {books.authors.map((author, index) => (
                  <div key={index}>
                    <p
                      style={{
                        fontSize: "1.2rem",
                        color: "#e6d5ff",
                        fontWeight: "bold",
                        marginBottom: "15px",
                      }}
                    >
                      {author.name}
                    </p>
                    <div style={{ color: "#b8a6d9", lineHeight: "2" }}>
                      <p style={{ fontSize: "0.95rem", marginBottom: "10px" }}>
                        📚 Tác phẩm nổi tiếng khác:
                      </p>
                      <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
                        <li>Through the Looking-Glass</li>
                        <li>The Hunting of the Snark</li>
                        <li>Jabberwocky</li>
                      </ul>
                    </div>
                  </div>
                ))} */}
              </div>

              {/* Book Statistics */}
              <div
                className={`magic-card ${isVisible ? "fade-in-up" : ""}`}
                style={{
                  padding: "25px",
                  opacity: isVisible ? 1 : 0,
                  animationDelay: "1.8s",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.4rem",
                    marginBottom: "20px",
                    color: "#ffd700",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  📊 Thông Tin Chi Tiết
                </h3>
                <div>
                  <div className="stat-item">
                    <span style={{ color: "#b8a6d9" }}>📅 Năm xuất bản:</span>
                    <span style={{ fontWeight: "bold", color: "#e6d5ff" }}>
                      {books.first_publish_year}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span style={{ color: "#b8a6d9" }}>📖 Số trang:</span>
                    <span style={{ fontWeight: "bold", color: "#e6d5ff" }}>
                      {books.number_of_pages_median}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span style={{ color: "#b8a6d9" }}>🌍 Ngôn ngữ:</span>
                    <span style={{ fontWeight: "bold", color: "#e6d5ff" }}>
                      English
                    </span>
                  </div>
                  <div className="stat-item">
                    <span style={{ color: "#b8a6d9" }}>🔖 ISBN:</span>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#e6d5ff",
                        fontSize: "0.9rem",
                      }}
                    >
                      {/* {books.isbn[0]} */}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span style={{ color: "#b8a6d9" }}>⭐ Đánh giá:</span>
                    <span style={{ fontWeight: "bold", color: "#ffd700" }}>
                      4.8/5 (2,450)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Publishers Section */}
            <div
              className={`magic-card ${isVisible ? "fade-in-up" : ""}`}
              style={{
                padding: "25px",
                opacity: isVisible ? 1 : 0,
                animationDelay: "2s",
              }}
            >
              <h3
                style={{
                  fontSize: "1.4rem",
                  marginBottom: "20px",
                  color: "#ffd700",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                🏢 Nhà Xuất Bản & Phiên Bản
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                {/* {books.publishers.map((publisher, index) => (
                  <span key={index} className="info-badge">
                    📚 {publisher}
                  </span>
                ))} */}
              </div>
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "rgba(138, 43, 226, 0.1)",
                  borderRadius: "10px",
                  borderLeft: "4px solid #ffd700",
                }}
              >
                <p
                  style={{
                    color: "#d4c5f9",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                  }}
                >
                  💡 <strong>Lưu ý:</strong> Sách có nhiều phiên bản từ các nhà
                  xuất bản khác nhau. Nội dung có thể khác biệt về hình minh họa
                  và chú thích.
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Books */}
          <div
            className={`${isVisible ? "fade-in-right" : ""}`}
            style={{
              opacity: isVisible ? 1 : 0,
              animationDelay: "1.8s",
            }}
          >
            <h2
              style={{
                fontSize: "1.8rem",
                color: "#ffd700",
                marginBottom: "20px",
              }}
            >
              💫 Gợi Ý Cho Bạn
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {recommendedBooks.map((recBook, index) => (
                <div
                  key={index}
                  className="recommend-card"
                  style={{
                    display: "flex",
                    gap: "15px",
                    padding: "15px",
                  }}
                >
                  <img
                    src={`https://covers.openlibrary.org/b/id/${recBook.cover_id}-M.jpg`}
                    alt={recBook.title}
                    style={{
                      width: "80px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        color: "#e6d5ff",
                        fontSize: "1rem",
                        marginBottom: "8px",
                      }}
                    >
                      {recBook.title}
                    </h4>
                    <div style={{ color: "#ffd700", fontSize: "0.9rem" }}>
                      ⭐ {recBook.rating}/5
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Comments */}
        <div
          className={`${isVisible ? "fade-in-up" : ""}`}
          style={{
            opacity: isVisible ? 1 : 0,
            animationDelay: "2s",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              color: "#ffd700",
              marginBottom: "25px",
            }}
          >
            💬 Bình Luận ({comments.length})
          </h2>

          {/* Comment Input */}
          <div
            className="magic-card"
            style={{
              padding: "20px",
              marginBottom: "25px",
            }}
          >
            <textarea
              placeholder="Viết bình luận của bạn..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "15px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(138, 43, 226, 0.3)",
                borderRadius: "10px",
                color: "#e6d5ff",
                fontSize: "1rem",
                resize: "vertical",
              }}
            />
            <button
              className="magic-button"
              style={{
                marginTop: "15px",
                padding: "12px 30px",
                backgroundColor: "#8a2be2",
                color: "white",
                border: "2px solid #9d4edd",
                borderRadius: "25px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            >
              ✍️ Gửi Bình Luận
            </button>
          </div>

          {/* Comments List */}
          <div>
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ fontSize: "2rem", marginRight: "12px" }}>
                    {comment.avatar}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: "#e6d5ff", marginBottom: "5px" }}>
                      {comment.user}
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <div style={{ color: "#ffd700" }}>
                        {"⭐".repeat(comment.rating)}
                      </div>
                      <span style={{ color: "#b8a6d9", fontSize: "0.85rem" }}>
                        {comment.date}
                      </span>
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    color: "#d4c5f9",
                    lineHeight: "1.6",
                    fontSize: "1rem",
                  }}
                >
                  {comment.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Borrow Modal */}
      {showBorrowModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleBorrowCancel}
        >
          <div
            className="magic-card"
            style={{
              width: "90%",
              maxWidth: "500px",
              padding: "40px",
              position: "relative",
              animation: "fadeIn 0.3s ease-in-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "2rem",
                color: "#ffd700",
                marginBottom: "30px",
                textAlign: "center",
              }}
            >
              📚 Mượn Sách
            </h2>

            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "1.2rem",
                  color: "#e6d5ff",
                  marginBottom: "15px",
                }}
              >
                📅 Chọn số ngày mượn:
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                {[7, 14, 21, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setBorrowDays(days)}
                    style={{
                      padding: "12px 24px",
                      backgroundColor:
                        borrowDays === days
                          ? "#8a2be2"
                          : "rgba(138, 43, 226, 0.2)",
                      color: borrowDays === days ? "white" : "#e6d5ff",
                      border:
                        borrowDays === days
                          ? "2px solid #9d4edd"
                          : "2px solid rgba(138, 43, 226, 0.3)",
                      borderRadius: "25px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: borrowDays === days ? "bold" : "normal",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {days} ngày
                  </button>
                ))}
              </div>

              <div style={{ marginTop: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "1rem",
                    color: "#b8a6d9",
                    marginBottom: "10px",
                  }}
                >
                  Hoặc nhập số ngày tùy chỉnh:
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={borrowDays}
                  onChange={(e) =>
                    setBorrowDays(
                      Math.max(1, Math.min(90, parseInt(e.target.value) || 1))
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "2px solid rgba(138, 43, 226, 0.3)",
                    borderRadius: "10px",
                    color: "#e6d5ff",
                    fontSize: "1.1rem",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                padding: "20px",
                backgroundColor: "rgba(138, 43, 226, 0.1)",
                borderRadius: "10px",
                marginBottom: "30px",
                borderLeft: "4px solid #ffd700",
              }}
            >
              <p
                style={{
                  color: "#d4c5f9",
                  fontSize: "1rem",
                  lineHeight: "1.6",
                }}
              >
                ℹ️ <strong>Lưu ý:</strong> Bạn sẽ mượn sách trong {borrowDays}{" "}
                ngày. Vui lòng trả sách đúng hạn để tránh phí phạt.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleBorrowCancel}
                disabled={isBorrowing}
                style={{
                  padding: "15px 40px",
                  backgroundColor: "transparent",
                  color: "#e6d5ff",
                  border: "2px solid rgba(138, 43, 226, 0.5)",
                  borderRadius: "30px",
                  cursor: isBorrowing ? "not-allowed" : "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  opacity: isBorrowing ? 0.5 : 1,
                }}
              >
                ❌ Hủy
              </button>
              <button
                onClick={handleBorrowConfirm}
                disabled={isBorrowing}
                className="magic-button"
                style={{
                  padding: "15px 40px",
                  backgroundColor: "#8a2be2",
                  color: "white",
                  border: "2px solid #9d4edd",
                  borderRadius: "30px",
                  cursor: isBorrowing ? "not-allowed" : "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  opacity: isBorrowing ? 0.5 : 1,
                }}
              >
                {isBorrowing ? "⏳ Đang xử lý..." : "✅ Xác Nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1001,
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            className="magic-card"
            style={{
              width: "90%",
              maxWidth: "600px",
              padding: "50px 40px",
              position: "relative",
              animation: "fadeIn 0.5s ease-in-out, scaleIn 0.5s ease-in-out",
              textAlign: "center",
              background:
                "linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(75, 0, 130, 0.3) 100%)",
              borderRadius: "20px",
              border: "3px solid rgba(255, 215, 0, 0.5)",
              boxShadow:
                "0 0 50px rgba(138, 43, 226, 0.6), 0 0 100px rgba(255, 215, 0, 0.3)",
            }}
          >
            {/* Success Icon with Animation */}
            <div
              style={{
                fontSize: "6rem",
                marginBottom: "30px",
                animation: "bounce 1s ease-in-out",
              }}
            >
              ✨🎉✨
            </div>

            {/* Success Title */}
            <h2
              style={{
                fontSize: "2.5rem",
                color: "#ffd700",
                marginBottom: "20px",
                fontWeight: "bold",
                textShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
                letterSpacing: "2px",
              }}
            >
              Mượn Sách Thành Công!
            </h2>

            {/* Success Message */}
            <div
              style={{
                fontSize: "1.2rem",
                color: "#e6d5ff",
                marginBottom: "25px",
                lineHeight: "1.8",
              }}
            >
              <p style={{ marginBottom: "15px" }}>
                🎊 <strong>Chúc mừng!</strong> Bạn đã mượn sách thành công!
              </p>
              <p style={{ color: "#b8a6d9", fontSize: "1.1rem" }}>
                📚{" "}
                <strong style={{ color: "#ffd700" }}>
                  &quot;{books?.title}&quot;
                </strong>
              </p>
              <p style={{ marginTop: "15px", color: "#d4c5f9" }}>
                ⏰ Thời gian mượn:{" "}
                <strong style={{ color: "#ffd700" }}>{borrowDays} ngày</strong>
              </p>
            </div>

            {/* Info Box */}
            <div
              style={{
                padding: "20px",
                backgroundColor: "rgba(138, 43, 226, 0.15)",
                borderRadius: "15px",
                marginBottom: "35px",
                border: "2px solid rgba(255, 215, 0, 0.3)",
              }}
            >
              <p
                style={{
                  color: "#d4c5f9",
                  fontSize: "1rem",
                  lineHeight: "1.8",
                  marginBottom: "10px",
                }}
              >
                💡 <strong>Lưu ý quan trọng:</strong>
              </p>
              <p
                style={{
                  color: "#b8a6d9",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                }}
              >
                Vui lòng trả sách đúng hạn để tránh bị phạt và giúp những người
                khác có cơ hội đọc sách này nhé! Bạn có thể kiểm tra thông tin
                mượn sách trong <strong>Trang Cá Nhân</strong> của mình.
              </p>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setBorrowDays(7);
                }}
                style={{
                  padding: "15px 35px",
                  backgroundColor: "rgba(138, 43, 226, 0.3)",
                  color: "#e6d5ff",
                  border: "2px solid rgba(138, 43, 226, 0.6)",
                  borderRadius: "30px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  transition: "all 0.3s ease",
                  letterSpacing: "1px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(138, 43, 226, 0.5)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(138, 43, 226, 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                📖 Tiếp Tục Khám Phá
              </button>
              <button
                onClick={() => router.push("/")}
                className="magic-button"
                style={{
                  padding: "15px 35px",
                  backgroundColor: "#8a2be2",
                  color: "white",
                  border: "2px solid #ffd700",
                  borderRadius: "30px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                  boxShadow: "0 0 20px rgba(138, 43, 226, 0.5)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-2px) scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 0 30px rgba(255, 215, 0, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(138, 43, 226, 0.5)";
                }}
              >
                🏠 Quay Về Trang Chủ
              </button>
            </div>

            {/* Decorative Elements */}
            <div
              style={{
                position: "absolute",
                top: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "3rem",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              📚
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookDetailsPage;
