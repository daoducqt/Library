"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  notificationApi,
  type Notification as NotificationType,
} from "@/service/notification/notification";
import socketService from "@/service/chat/socketService";

type Props = {
  onSearch?: (q: string) => void;
};

export default function Header({ onSearch }: Props) {
  const [query, setQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response?.data) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await notificationApi.getNotifications();
      if (response?.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  // Mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType["type"]) => {
    switch (type) {
      case "BORROW":
        return "📚";
      case "RETURN":
        return "✅";
      case "DUE_SOON":
        return "⏰";
      case "OVERDUE":
        return "⚠️";
      case "FINE":
        return "💰";
      default:
        return "🔔";
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Socket connection for realtime notifications
  useEffect(() => {
    const token = localStorage.getItem("accessToken")?.replace(/"/g, "");
    if (!token) return;

    // Connect socket
    socketService.connect(token);

    // Listen for new notifications
    socketService.onNewNotification((notification: unknown) => {
      const newNotification = notification as NotificationType;
      console.log("New notification received:", newNotification);

      // Add to notifications list (at the beginning)
      setNotifications((prev) => {
        // Avoid duplicates
        if (prev.some((n) => n._id === newNotification._id)) {
          return prev;
        }
        return [newNotification, ...prev].slice(0, 10); // Keep only 10
      });

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if permitted
      if (Notification.permission === "granted") {
        new window.Notification(newNotification.title, {
          body: newNotification.message,
          icon: "/favicon.ico",
        });
      }
    });

    return () => {
      socketService.offNewNotification();
    };
  }, []);

  // Request notification permission
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (notificationDropdownOpen) {
      fetchNotifications();
    }
  }, [notificationDropdownOpen, fetchNotifications]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (onSearch) onSearch(query);
    console.log("Search:", query);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 text-white shadow-xl sticky top-0 z-50 border-b border-cyan-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Library Name */}
          <Link
            href="/"
            className="flex items-center gap-3 text-white no-underline hover:opacity-90 transition-opacity"
          >
            <div className="relative">
              <svg
                className="w-10 h-10"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Modern book icon with gradient effect */}
                <path
                  d="M12 8C10.3431 8 9 9.34315 9 11V37C9 38.6569 10.3431 40 12 40H36C37.6569 40 39 38.6569 39 37V11C39 9.34315 37.6569 8 36 8H12Z"
                  fill="white"
                  opacity="0.9"
                />
                <path d="M14 12H34V36H14V12Z" fill="url(#gradient1)" />
                <path
                  d="M18 16H30M18 20H30M18 24H26"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="24" cy="32" r="3" fill="#FCD34D" />
                <defs>
                  <linearGradient
                    id="gradient1"
                    x1="14"
                    y1="12"
                    x2="34"
                    y2="36"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#818CF8" />
                    <stop offset="1" stopColor="#C084FC" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="hidden sm:block">
              <div className="text-xl font-bold tracking-tight">
                📚 The Mind Library
              </div>
              <div className="text-xs text-white/80 font-light">
                Khám phá tri thức vô tận
              </div>
            </div>
          </Link>

          {/* Search Bar - Center */}
          <form
            onSubmit={submit}
            className="flex-1 max-w-2xl mx-4 hidden md:block"
          >
            <div className="relative">
              <input
                id="site-search"
                name="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm sách, tác giả, thể loại..."
                className="w-full px-4 py-2 pl-10 pr-24 rounded-full text-gray-100 bg-white/15 backdrop-blur-md border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 placeholder-gray-300/70 shadow-lg hover:bg-white/20 transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-1.5 rounded-full font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Notification + User Account Dropdown */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() =>
                  setNotificationDropdownOpen(!notificationDropdownOpen)
                }
                className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all border border-white/20"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[70vh] flex flex-col">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-cyan-800 px-4 py-3 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      🔔 Thông báo
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {unreadCount} mới
                        </span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-cyan-300 hover:text-cyan-100 transition-colors"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="overflow-y-auto flex-1">
                    {isLoadingNotifications ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <svg
                          className="w-12 h-12 mb-2 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        <p className="text-sm">Không có thông báo nào</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => {
                            if (!notification.isRead) {
                              handleMarkAsRead(notification._id);
                            }
                            if (notification.link) {
                              window.location.href = notification.link;
                            }
                            setNotificationDropdownOpen(false);
                          }}
                          className={`px-4 py-3 border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                            !notification.isRead ? "bg-cyan-900/20" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`font-medium text-sm truncate ${
                                    !notification.isRead
                                      ? "text-white"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <Link
                      href="/notifications"
                      className="block text-center py-3 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-gray-800/50 transition-colors border-t border-gray-700"
                      onClick={() => setNotificationDropdownOpen(false)}
                    >
                      Xem tất cả thông báo
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* User Account Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all border border-white/20"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Info Section */}
                  <div className="bg-gradient-to-r from-slate-800 to-cyan-800 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg border-2 border-white/30">
                        JD
                      </div>
                      <div>
                        <div className="font-semibold text-white">John Doe</div>
                        <div className="text-xs text-white/80">
                          john.doe@email.com
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-gray-800 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="font-medium">Hồ sơ của tôi</span>
                    </Link>

                    <Link
                      href="/my-books"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-gray-800 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 text-blue-400"
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
                      <span className="font-medium">Sách của tôi</span>
                    </Link>

                    <Link
                      href="/borrowed"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-gray-800 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 text-teal-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                      <span className="font-medium">Sách đã mượn</span>
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-200 hover:bg-gray-800 transition-colors"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="font-medium">Cài đặt</span>
                    </Link>

                    <hr className="my-2 border-gray-700" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        // Add logout logic here
                        console.log("Logging out...");
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-gray-800 transition-colors w-full"
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
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="font-medium">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={submit}>
            <div className="relative">
              <input
                name="query-mobile"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm sách..."
                className="w-full px-4 py-2 pl-10 rounded-full text-gray-100 bg-white/15 backdrop-blur-md border border-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 placeholder-gray-300/70"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
