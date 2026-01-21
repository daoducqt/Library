import axiosClient from "@/src/api/axiosClient";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    fullName: string;
    avatar?: string;
    userName: string;
  };
  senderType: "USER" | "ADMIN" | "SUPER_ADMIN";
  content: string;
  messageType: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  attachmentUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    avatar?: string;
    userName: string;
    email?: string;
  };
  adminId?: {
    _id: string;
    fullName: string;
    avatar?: string;
    userName: string;
  };
  status: "OPEN" | "CLOSED" | "PENDING";
  lastMessage: string;
  lastMessageAt: string;
  unreadByUser: number;
  unreadByAdmin: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Lấy hoặc tạo conversation cho user
export const getOrCreateConversation = async (): Promise<{
  success: boolean;
  data: Conversation;
}> => {
  const response = await axiosClient.get("/api/chat/my-conversation");
  return response.data;
};

// Lấy tin nhắn của một conversation
export const getMessages = async (
  conversationId: string,
  page = 1,
  limit = 50
): Promise<MessagesResponse> => {
  const response = await axiosClient.get(
    `/api/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Gửi tin nhắn
export const sendMessage = async (
  conversationId: string,
  content: string,
  messageType: string = "TEXT"
): Promise<{ success: boolean; data: Message }> => {
  const response = await axiosClient.post(
    `/api/chat/conversations/${conversationId}/messages`,
    { content, messageType }
  );
  return response.data;
};

// Đánh dấu đã đọc
export const markAsRead = async (conversationId: string): Promise<void> => {
  await axiosClient.post(`/api/chat/conversations/${conversationId}/read`);
};
