"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getConversations,
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

export default function AdminChatBox({ isOpen, onClose }: ChatBoxProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map(),
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, []);

  // Fetch messages for selected conversation
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

  // Initialize socket connection
  useEffect(() => {
    if (!isOpen) return;

    // Lấy token từ cookie hoặc localStorage
    let token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("accessToken="))
      ?.split("=")[1];

    // Nếu không có trong cookie, thử lấy từ localStorage
    if (!token) {
      token =
        localStorage.getItem("accessToken")?.replace(/"/g, "") || undefined;
    }

    console.log("Admin Socket token:", token ? "Found" : "Not found");

    if (token) {
      const socket = socketService.connect(token);
      console.log("Admin Socket connected:", socket?.connected);
    }

    fetchConversations();

    return () => {
      socketService.offAll();
    };
  }, [isOpen, fetchConversations]);

  // Socket event listeners
  useEffect(() => {
    if (!isOpen) return;

    // Lắng nghe tin nhắn mới
    socketService.onNewMessage((data) => {
      const { conversationId, message } = data;

      // Cập nhật tin nhắn nếu đang trong conversation đó
      if (selectedConversation?._id === conversationId) {
        setMessages((prev) => [...prev, message as Message]);
      }

      // Cập nhật conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? {
                ...conv,
                lastMessage: (message as Message).content,
                lastMessageAt: (message as Message).createdAt,
                unreadByAdmin:
                  selectedConversation?._id === conversationId
                    ? conv.unreadByAdmin
                    : conv.unreadByAdmin + 1,
              }
            : conv,
        ),
      );
    });

    // Lắng nghe thông báo tin nhắn mới từ các conversation khác
    socketService.onNewMessageNotification(() => {
      fetchConversations();
    });

    // Lắng nghe typing
    socketService.onUserTyping((data) => {
      setTypingUsers((prev) =>
        new Map(prev).set(data.user._id, data.user.fullName),
      );
    });

    socketService.onUserStopTyping((data) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.userId);
        return newMap;
      });
    });

    // Lắng nghe đã đọc
    socketService.onMessagesRead(({ conversationId }) => {
      if (selectedConversation?._id === conversationId) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
      }
    });

    // Lắng nghe khi conversation được assign
    socketService.onConversationAssigned(
      (data: { conversationId: string; conversation: Conversation }) => {
        // Cập nhật conversation trong list
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === data.conversationId ? data.conversation : conv,
          ),
        );
        // Cập nhật selectedConversation nếu đang chọn
        if (selectedConversation?._id === data.conversationId) {
          setSelectedConversation(data.conversation);
        }
      },
    );

    return () => {
      socketService.offAll();
    };
  }, [isOpen, selectedConversation, fetchConversations]);

  // Join/Leave conversation room
  useEffect(() => {
    if (selectedConversation) {
      socketService.joinConversation(selectedConversation._id);
      fetchMessages(selectedConversation._id);
    }

    return () => {
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation._id);
      }
    };
  }, [selectedConversation, fetchMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const socket = socketService.getSocket();
    console.log("Sending message, socket connected:", socket?.connected);
    console.log("Conversation ID:", selectedConversation._id);
    console.log("Message:", newMessage.trim());

    if (!socket?.connected) {
      console.error("Socket not connected!");
      return;
    }

    socketService.sendMessage(selectedConversation._id, newMessage.trim());
    setNewMessage("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketService.stopTyping(selectedConversation._id);
  };

  // Handle typing
  const handleTyping = () => {
    if (!selectedConversation) return;

    socketService.startTyping(selectedConversation._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(selectedConversation._id);
    }, 2000);
  };

  // Handle assign conversation
  const handleAssign = async (conversation: Conversation) => {
    try {
      // Gọi socket để assign
      socketService.assignConversation(conversation._id);

      // Cập nhật UI ngay lập tức (optimistic update)
      const updatedConversation = {
        ...conversation,
        status: "OPEN" as const,
      };
      setSelectedConversation(updatedConversation);
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversation._id ? updatedConversation : conv,
        ),
      );
    } catch (error) {
      console.error("Error assigning conversation:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[900px] h-[600px] flex overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b bg-blue-600 text-white flex justify-between items-center">
            <h2 className="font-semibold text-lg">💬 Chat hỗ trợ</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded p-1"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Chưa có cuộc hội thoại nào
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?._id === conv._id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {conv.userId?.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate">
                          {conv.userId?.fullName || "Unknown User"}
                        </span>
                        {conv.unreadByAdmin > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {conv.unreadByAdmin}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage || "Bắt đầu trò chuyện..."}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            conv.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : conv.status === "OPEN"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {conv.status === "PENDING"
                            ? "Chờ xử lý"
                            : conv.status === "OPEN"
                              ? "Đang mở"
                              : "Đã đóng"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {selectedConversation.userId?.fullName
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.userId?.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.userId?.email}
                    </p>
                  </div>
                </div>
                {selectedConversation.status === "PENDING" && (
                  <button
                    onClick={() => handleAssign(selectedConversation)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Nhận hỗ trợ
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
                {loading ? (
                  <div className="text-center text-gray-500">Đang tải...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Chưa có tin nhắn nào
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.senderType !== "USER"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.senderType !== "USER"
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            msg.senderType !== "USER"
                              ? "text-blue-100"
                              : "text-gray-400"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {msg.senderType !== "USER" && msg.isRead && " ✓✓"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {typingUsers.size > 0 && (
                  <div className="text-gray-500 text-sm italic">
                    {Array.from(typingUsers.values()).join(", ")} đang gõ...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white">
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
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p>Chọn một cuộc hội thoại để bắt đầu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
