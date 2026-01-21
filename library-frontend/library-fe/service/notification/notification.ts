// src/api/notification.api.ts
import { repositoryApi } from "@/src/api/repositories/Repository";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  link?: string | null;
  type:
    | "BORROW"
    | "RETURN"
    | "DUE_SOON"
    | "OVERDUE"
    | "FINE"
    | "ADMIN_NEW_BORROW"
    | "ADMIN_RETURN"
    | "ADMIN_OVERDUE"
    | "ADMIN_FINE_PAYMENT"
    | "ADMIN_USER_VIOLATION"
    | "OTHER";
  loanId?: string | null;
  bookId?: string | null;
  fineId?: string | null;
  isRead: boolean;
  targetRole: "USER" | "ADMIN" | "SUPER_ADMIN";
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  status: number;
  message: string;
  data: Notification[];
}

export interface UnreadCountResponse {
  status: number;
  message: string;
  data: {
    unreadCount: number;
  };
}

export interface MarkReadResponse {
  status: number;
  message: string;
  data: Notification;
}

export interface MarkAllReadResponse {
  status: number;
  message: string;
  data: {
    modifiedCount: number;
  };
}

export const notificationApi = {
  // Lấy danh sách thông báo
  getNotifications() {
    return repositoryApi.get<NotificationResponse>("/notification");
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount() {
    return repositoryApi.get<UnreadCountResponse>("/notification/unread");
  },

  // Đánh dấu 1 thông báo đã đọc
  markAsRead(id: string) {
    return repositoryApi.post<MarkReadResponse>(`/notification/is-read/${id}`);
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead() {
    return repositoryApi.post<MarkAllReadResponse>("/notification/is-read-all");
  },

  // Xóa thông báo
  deleteNotification(id: string) {
    return repositoryApi.delete<{ status: number; message: string }>(
      `/notification/delete/${id}`
    );
  },
};
