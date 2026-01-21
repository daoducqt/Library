"use client";

import { io, Socket } from "socket.io-client";

// Lưu socket vào window để tránh bị reset khi HMR
declare global {
  interface Window {
    __adminSocketInstance?: Socket | null;
  }
}

class SocketService {
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  private getSocketFromWindow(): Socket | null {
    if (typeof window !== "undefined") {
      return window.__adminSocketInstance || null;
    }
    return null;
  }

  private setSocketToWindow(socket: Socket | null): void {
    if (typeof window !== "undefined") {
      window.__adminSocketInstance = socket;
    }
  }

  connect(token: string): Socket {
    const existingSocket = this.getSocketFromWindow();
    
    if (existingSocket?.connected) {
      console.log("Socket already connected, reusing:", existingSocket.id);
      return existingSocket;
    }

    // Nếu socket tồn tại nhưng không connected, disconnect trước
    if (existingSocket) {
      console.log("Socket exists but not connected, reconnecting...");
      existingSocket.disconnect();
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3003";
    console.log("Connecting to socket URL:", socketUrl);

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    this.setSocketToWindow(newSocket);
    return newSocket;
  }

  disconnect(): void {
    const socket = this.getSocketFromWindow();
    if (socket) {
      socket.disconnect();
      this.setSocketToWindow(null);
    }
  }

  getSocket(): Socket | null {
    return this.getSocketFromWindow();
  }

  // Join conversation room
  joinConversation(conversationId: string): void {
    const socket = this.getSocketFromWindow();
    socket?.emit("join_conversation", conversationId);
  }

  // Leave conversation room
  leaveConversation(conversationId: string): void {
    const socket = this.getSocketFromWindow();
    socket?.emit("leave_conversation", conversationId);
  }

  // Send message
  sendMessage(conversationId: string, content: string, messageType = "TEXT"): void {
    const socket = this.getSocketFromWindow();
    console.log("SocketService sendMessage - socket exists:", !!socket, "connected:", socket?.connected);
    if (!socket?.connected) {
      console.error("Cannot send message: Socket not connected");
      return;
    }
    socket.emit("send_message", {
      conversationId,
      content,
      messageType,
    });
    console.log("Message emitted to server");
  }

  // Mark messages as read
  markRead(conversationId: string): void {
    const socket = this.getSocketFromWindow();
    socket?.emit("mark_read", conversationId);
  }

  // Typing indicators
  startTyping(conversationId: string): void {
    const socket = this.getSocketFromWindow();
    socket?.emit("typing_start", conversationId);
  }

  stopTyping(conversationId: string): void {
    const socket = this.getSocketFromWindow();
    socket?.emit("typing_stop", conversationId);
  }

  // Assign conversation (admin only)
  assignConversation(conversationId: string): void {
    const socket = this.getSocketFromWindow();
    socket?.emit("assign_conversation", conversationId);
  }

  // Event listeners
  onNewMessage(callback: (data: { conversationId: string; message: unknown }) => void): void {
    const socket = this.getSocketFromWindow();
    socket?.on("new_message", callback);
  }

  onNewMessageNotification(callback: (data: unknown) => void): void {
    const socket = this.getSocketFromWindow();
    socket?.on("new_message_notification", callback);
  }

  onMessagesRead(callback: (data: { conversationId: string; readBy: string }) => void): void {
    const socket = this.getSocketFromWindow();
    socket?.on("messages_read", callback);
  }

  onUserTyping(callback: (data: { conversationId: string; user: { _id: string; fullName: string } }) => void): void {
    const socket = this.getSocketFromWindow();
    socket?.on("user_typing", callback);
  }

  onUserStopTyping(callback: (data: { conversationId: string; userId: string }) => void): void {
    const socket = this.getSocketFromWindow();
    socket?.on("user_stop_typing", callback);
  }

  onConversationAssigned<T = unknown>(callback: (data: T) => void): void {
    const socket = this.getSocketFromWindow();
    socket?.on("conversation_assigned", callback as (data: unknown) => void);
  }

  onAdminJoined(callback: (data: unknown) => void): void {
    const socket = this.getSocketFromWindow();
    socket?.on("admin_joined", callback);
  }

  // Remove listeners
  offNewMessage(): void {
    const socket = this.getSocketFromWindow();
    socket?.off("new_message");
  }

  offNewMessageNotification(): void {
    const socket = this.getSocketFromWindow();
    socket?.off("new_message_notification");
  }

  offMessagesRead(): void {
    const socket = this.getSocketFromWindow();
    socket?.off("messages_read");
  }

  offUserTyping(): void {
    const socket = this.getSocketFromWindow();
    socket?.off("user_typing");
  }

  offUserStopTyping(): void {
    const socket = this.getSocketFromWindow();
    socket?.off("user_stop_typing");
  }

  offConversationAssigned(): void {
    const socket = this.getSocketFromWindow();
    socket?.off("conversation_assigned");
  }

  offAll(): void {
    this.offNewMessage();
    this.offNewMessageNotification();
    this.offMessagesRead();
    this.offUserTyping();
    this.offUserStopTyping();
    this.offConversationAssigned();
  }
}

export const socketService = SocketService.getInstance();
export default socketService;
