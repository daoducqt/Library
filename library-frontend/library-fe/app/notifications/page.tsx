"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/component/header";
import {
  notificationApi,
  type Notification as NotificationType,
} from "@/service/notification/notification";
import socketService from "@/service/chat/socketService";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notificationApi.getNotifications();
      if (response?.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete notification
  const handleDelete = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
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

  // Get notification type label
  const getNotificationTypeLabel = (type: NotificationType["type"]) => {
    switch (type) {
      case "BORROW":
        return "Mượn sách";
      case "RETURN":
        return "Trả sách";
      case "DUE_SOON":
        return "Sắp hết hạn";
      case "OVERDUE":
        return "Quá hạn";
      case "FINE":
        return "Phạt";
      default:
        return "Khác";
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
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
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
        return [newNotification, ...prev];
      });
    });

    return () => {
      socketService.offNewNotification();
    };
  }, []);

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🔔 Thông báo
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">
                  {unreadCount} chưa đọc
                </span>
              )}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Quản lý tất cả thông báo của bạn
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Đọc tất cả
              </button>
            )}
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Quay lại
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-cyan-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-cyan-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4 opacity-50">🔔</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {filter === "unread"
                  ? "Không có thông báo chưa đọc"
                  : "Không có thông báo nào"}
              </h3>
              <p className="text-gray-500">
                {filter === "unread"
                  ? "Bạn đã đọc tất cả thông báo!"
                  : "Thông báo mới sẽ xuất hiện ở đây"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-gray-800/50 rounded-xl p-4 border transition-all hover:bg-gray-800/70 ${
                  !notification.isRead
                    ? "border-cyan-500/50 bg-cyan-900/10"
                    : "border-gray-700/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          notification.type === "OVERDUE" ||
                          notification.type === "FINE"
                            ? "bg-red-500/20 text-red-400"
                            : notification.type === "DUE_SOON"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : notification.type === "RETURN"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-cyan-500/20 text-cyan-400"
                        }`}
                      >
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                      )}
                    </div>

                    <h3
                      className={`font-semibold mb-1 ${
                        !notification.isRead ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {notification.message}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Đánh dấu đã đọc"
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    )}
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Xem chi tiết"
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
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Xóa thông báo"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
