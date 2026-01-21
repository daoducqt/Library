"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserChatBox from "./UserChatBox";
import { getOrCreateConversation } from "@/service/chat/chatService";

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check đăng nhập bằng localStorage (user info được lưu khi login)
  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  // Fetch unread count
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUnread = async () => {
      try {
        const response = await getOrCreateConversation();
        if (response.success) {
          setUnreadCount(response.data.unreadByUser);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Reset unread when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleClick = () => {
    // Check localStorage mỗi lần click
    const user = localStorage.getItem("user");

    if (!user) {
      // Chưa đăng nhập thì mở trang login trong tab mới hoặc thông báo
      alert("Vui lòng đăng nhập để sử dụng chat hỗ trợ");
      return;
    }
    setIsOpen(!isOpen);
  };

  // Chỉ hiển thị nút chat khi đã đăng nhập
  if (!isLoggedIn) return null;

  return (
    <>
      {/* Chat Button - Hiển thị ở góc dưới phải */}
      <button
        onClick={handleClick}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center z-40 ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        }`}
        title="Chat với hỗ trợ"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        )}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Box - Chỉ hiện khi mở */}
      <UserChatBox isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
