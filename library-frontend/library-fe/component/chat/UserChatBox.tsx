"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getOrCreateConversation,
  getMessages,
  markAsRead,
  Conversation,
  Message,
} from "@/service/chat/chatService";
import socketService from "@/service/chat/socketService";

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserChatBox({ isOpen, onClose }: ChatBoxProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch or create conversation
  const fetchConversation = useCallback(async () => {
    try {
      const response = await getOrCreateConversation();
      if (response.success) {
        setConversation(response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
    return null;
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await getMessages(conversationId);
      if (response.success) {
        setMessages(response.data);
        await markAsRead(conversationId);
        socketService.markRead(conversationId);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize - chỉ chạy khi isOpen thay đổi
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const init = async () => {
      // Ưu tiên lấy token từ localStorage trước
      let token = localStorage.getItem("accessToken")?.replace(/"/g, "");

      // Nếu không có trong localStorage, thử lấy từ cookie
      if (!token) {
        token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];
      }

      console.log("Socket token:", token ? "Found" : "Not found");

      if (token) {
        const socket = socketService.connect(token);
        console.log("Socket connected:", socket?.connected);

        // Thiết lập listener cho admin_joined ngay sau khi connect
        socket?.on("admin_joined", (data) => {
          console.log("Admin joined event received:", data);
        });
      } else {
        console.log("No token found, socket will not connect");
        return;
      }

      const conv = await fetchConversation();
      console.log("Conversation:", conv);

      if (conv && isMounted) {
        socketService.joinConversation(conv._id);
        console.log("Joined conversation room:", conv._id);
        await fetchMessages(conv._id);
      }
    };

    init();

    return () => {
      isMounted = false;
      socketService.offAll();
    };
  }, [isOpen]); // Chỉ phụ thuộc vào isOpen

  // Cleanup khi conversation thay đổi hoặc unmount
  useEffect(() => {
    return () => {
      if (conversation) {
        socketService.leaveConversation(conversation._id);
      }
    };
  }, [conversation]);

  // Socket event listeners
  useEffect(() => {
    if (!isOpen || !conversation) return;

    // Lắng nghe tin nhắn mới
    socketService.onNewMessage((data) => {
      const { conversationId, message } = data;
      if (conversationId === conversation._id) {
        setMessages((prev) => [...prev, message as Message]);
        socketService.markRead(conversationId);
      }
    });

    // Lắng nghe typing
    socketService.onUserTyping((data) => {
      if (data.conversationId === conversation._id) {
        setIsTyping(true);
        setTypingUser(data.user.fullName);
      }
    });

    socketService.onUserStopTyping((data) => {
      if (data.conversationId === conversation._id) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    // Lắng nghe đã đọc
    socketService.onMessagesRead(({ conversationId }) => {
      if (conversationId === conversation._id) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
      }
    });

    // Lắng nghe admin join
    socketService.onAdminJoined((data) => {
      console.log(
        "onAdminJoined callback:",
        data,
        "current conversation:",
        conversation?._id,
      );
      if (data.conversationId === conversation._id) {
        console.log("Updating conversation with admin:", data.admin);
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                adminId: {
                  _id: data.admin._id,
                  fullName: data.admin.fullName,
                  avatar: data.admin.avatar,
                  userName: data.admin.fullName,
                },
                status: "OPEN" as const,
              }
            : null,
        );
      }
    });

    return () => {
      socketService.offAll();
    };
  }, [isOpen, conversation]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversation) return;

    socketService.sendMessage(conversation._id, newMessage.trim());
    setNewMessage("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketService.stopTyping(conversation._id);
  };

  // Handle typing
  const handleTyping = () => {
    if (!conversation) return;

    socketService.startTyping(conversation._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(conversation._id);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[380px] h-[500px] flex flex-col overflow-hidden border">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              💬
            </div>
            <div>
              <h3 className="font-semibold">Hỗ trợ trực tuyến</h3>
              <p className="text-xs text-blue-100">
                {conversation?.adminId
                  ? `${conversation.adminId.fullName} đang hỗ trợ`
                  : "Chờ kết nối với admin..."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loading ? (
            <div className="text-center text-gray-500">Đang tải...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <div className="text-5xl mb-3">👋</div>
              <p className="font-medium">Xin chào!</p>
              <p className="text-sm">Hãy gửi tin nhắn để bắt đầu trò chuyện</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.senderType === "USER" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.senderType !== "USER" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm mr-2 flex-shrink-0">
                    {msg.senderId?.fullName?.charAt(0) || "A"}
                  </div>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    msg.senderType === "USER"
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow-sm rounded-bl-md"
                  }`}
                >
                  <p className="break-words text-sm">{msg.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      msg.senderType === "USER"
                        ? "text-blue-100"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.senderType === "USER" && msg.isRead && " ✓✓"}
                  </div>
                </div>
              </div>
            ))
          )}
          {isTyping && typingUser && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                A
              </div>
              <div className="bg-white px-3 py-2 rounded-full shadow-sm">
                <span className="animate-pulse">{typingUser} đang gõ...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
