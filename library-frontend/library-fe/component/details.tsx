"use client";
import React, { useEffect, useState } from "react";

interface Author {
  key: string;
  name: string;
}

interface BookDetails {
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
const BookDetailsPage: React.FC< BookDetailsProps> = ({ slug }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const book: BookDetails = {
    title: "Alice's Adventures in Wonderland",
    authors: [{ key: "/authors/OL22098A", name: "Lewis Carroll" }],
    first_publish_year: 1865,
    number_of_pages_median: 96,
    subjects: [
      "Fiction",
      "Fantasy",
      "Children's literature",
      "Adventure stories",
      "Classic literature",
    ],
    publishers: ["Dover Publications", "Penguin Classics"],
    isbn: ["9780486275437", "9780141439761"],
    cover_id: 10527963,
    description:
      "Alice's Adventures in Wonderland is an 1865 novel by English author Lewis Carroll. It tells of a young girl named Alice, who falls through a rabbit hole into a subterranean fantasy world populated by peculiar, anthropomorphic creatures. The tale plays with logic, giving the story lasting popularity with adults as well as with children.",
    language: ["eng"],
    type: "online",
  };

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
              src={`https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`}
              alt={book.title}
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
              {book.title}
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
              ✨ by {book.authors.map((author) => author.name).join(", ")}
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
                style={{
                  padding: "15px 50px",
                  backgroundColor:
                    book.type === "online" ? "#1e88e5" : "#8a2be2",
                  color: "white",
                  border:
                    "2px solid " +
                    (book.type === "online" ? "#42a5f5" : "#9d4edd"),
                  borderRadius: "30px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                {book.type === "online" ? "📖 Đọc Online" : "📚 Thuê Sách"}
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
                {book.subjects.map((subject, index) => (
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
                {book.description}
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
                {book.authors.map((author, index) => (
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
                ))}
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
                      {book.first_publish_year}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span style={{ color: "#b8a6d9" }}>📖 Số trang:</span>
                    <span style={{ fontWeight: "bold", color: "#e6d5ff" }}>
                      {book.number_of_pages_median}
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
                      {book.isbn[0]}
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
                {book.publishers.map((publisher, index) => (
                  <span key={index} className="info-badge">
                    📚 {publisher}
                  </span>
                ))}
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
    </>
  );
};

export default BookDetailsPage;
