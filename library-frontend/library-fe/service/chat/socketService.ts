"use client";

import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3003";

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Join conversation room
  joinConversation(conversationId: string): void {
    this.socket?.emit("join_conversation", conversationId);
  }

  // Leave conversation room
  leaveConversation(conversationId: string): void {
    this.socket?.emit("leave_conversation", conversationId);
  }

  // Send message
  sendMessage(conversationId: string, content: string, messageType = "TEXT"): void {
    this.socket?.emit("send_message", {
      conversationId,
      content,
      messageType,
    });
  }

  // Mark messages as read
  markRead(conversationId: string): void {
    this.socket?.emit("mark_read", conversationId);
  }

  // Typing indicators
  startTyping(conversationId: string): void {
    this.socket?.emit("typing_start", conversationId);
  }

  stopTyping(conversationId: string): void {
    this.socket?.emit("typing_stop", conversationId);
  }

  // Event listeners
  onNewMessage(callback: (data: { conversationId: string; message: unknown }) => void): void {
    this.socket?.on("new_message", callback);
  }

  onNewMessageNotification(callback: (data: unknown) => void): void {
    this.socket?.on("new_message_notification", callback);
  }

  onMessagesRead(callback: (data: { conversationId: string; readBy: string }) => void): void {
    this.socket?.on("messages_read", callback);
  }

  onUserTyping(callback: (data: { conversationId: string; user: { _id: string; fullName: string } }) => void): void {
    this.socket?.on("user_typing", callback);
  }

  onUserStopTyping(callback: (data: { conversationId: string; userId: string }) => void): void {
    this.socket?.on("user_stop_typing", callback);
  }

  onAdminJoined(callback: (data: { conversationId: string; admin: { _id: string; fullName: string; avatar?: string } }) => void): void {
    this.socket?.on("admin_joined", callback);
  }

  // Remove listeners
  offNewMessage(): void {
    this.socket?.off("new_message");
  }

  offNewMessageNotification(): void {
    this.socket?.off("new_message_notification");
  }

  offMessagesRead(): void {
    this.socket?.off("messages_read");
  }

  offUserTyping(): void {
    this.socket?.off("user_typing");
  }

  offUserStopTyping(): void {
    this.socket?.off("user_stop_typing");
  }

  offAdminJoined(): void {
    this.socket?.off("admin_joined");
  }

  offAll(): void {
    this.offNewMessage();
    this.offNewMessageNotification();
    this.offMessagesRead();
    this.offUserTyping();
    this.offUserStopTyping();
    this.offAdminJoined();
  }
}

export const socketService = SocketService.getInstance();
export default socketService;
