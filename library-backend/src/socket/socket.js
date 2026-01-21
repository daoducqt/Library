import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../chat/model/message.model.js";
import Conversation from "../chat/model/conversation.model.js";
import User from "../user/models/User.js";

// Lưu trữ mapping userId -> socketId
const userSockets = new Map();
const adminSockets = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        process.env.CLIENT_URL,
      ].filter(Boolean),
      credentials: true,
    },
  });

  // Middleware xác thực
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.log("Socket: No token provided");
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      console.log("Socket decoded token:", decoded._id || decoded.id);
      
      // Tìm user bằng _id (có thể là string hoặc ObjectId)
      const userId = decoded._id || decoded.id;
      const user = await User.findById(userId);

      if (!user) {
        console.log("Socket: User not found for id:", userId);
        return next(new Error("Authentication error: User not found"));
      }

      console.log("Socket: User authenticated:", user.fullName, user.role);
      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    console.log(`User connected: ${user.fullName} (${user._id})`);

    // Lưu socket theo role
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      adminSockets.set(user._id.toString(), socket.id);
      socket.join("admins"); // Admin join room chung
    } else {
      userSockets.set(user._id.toString(), socket.id);
    }

    // Join vào room cá nhân
    socket.join(user._id.toString());

    // ======== EVENTS ========

    // User/Admin join vào conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`${user.fullName} joined conversation: ${conversationId}`);
    });

    // Rời conversation room
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`${user.fullName} left conversation: ${conversationId}`);
    });

    // Gửi tin nhắn
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, messageType = "TEXT", attachmentUrl } = data;

        // Kiểm tra conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        // Tạo tin nhắn
        const message = await Message.create({
          conversationId,
          senderId: user._id,
          senderType: user.role,
          content,
          messageType,
          attachmentUrl,
        });

        // Cập nhật conversation
        const updateData = {
          lastMessage: content,
          lastMessageAt: new Date(),
        };

        if (user.role === "USER") {
          updateData.unreadByAdmin = conversation.unreadByAdmin + 1;
        } else {
          updateData.unreadByUser = conversation.unreadByUser + 1;
        }

        await Conversation.findByIdAndUpdate(conversationId, updateData);

        // Populate tin nhắn
        const populatedMessage = await Message.findById(message._id).populate(
          "senderId",
          "fullName avatar userName"
        );

        // Emit tin nhắn đến conversation room
        io.to(`conversation:${conversationId}`).emit("new_message", {
          conversationId,
          message: populatedMessage,
        });

        // Thông báo đến admin room về tin nhắn mới (nếu user gửi)
        if (user.role === "USER") {
          io.to("admins").emit("new_message_notification", {
            conversationId,
            userId: conversation.userId,
            message: populatedMessage,
          });
        } else {
          // Thông báo đến user cụ thể
          const userSocketId = userSockets.get(conversation.userId.toString());
          if (userSocketId) {
            io.to(userSocketId).emit("new_message_notification", {
              conversationId,
              message: populatedMessage,
            });
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Đánh dấu đã đọc
    socket.on("mark_read", async (conversationId) => {
      try {
        await Message.updateMany(
          {
            conversationId,
            senderId: { $ne: user._id },
            isRead: false,
          },
          {
            isRead: true,
            readAt: new Date(),
          }
        );

        const updateData =
          user.role === "USER" ? { unreadByUser: 0 } : { unreadByAdmin: 0 };

        await Conversation.findByIdAndUpdate(conversationId, updateData);

        // Emit sự kiện đã đọc
        io.to(`conversation:${conversationId}`).emit("messages_read", {
          conversationId,
          readBy: user._id,
        });
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    });

    // Typing indicator
    socket.on("typing_start", (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit("user_typing", {
        conversationId,
        user: {
          _id: user._id,
          fullName: user.fullName,
        },
      });
    });

    socket.on("typing_stop", (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit("user_stop_typing", {
        conversationId,
        userId: user._id,
      });
    });

    // Admin nhận conversation
    socket.on("assign_conversation", async (conversationId) => {
      if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      try {
        const conversation = await Conversation.findByIdAndUpdate(
          conversationId,
          {
            adminId: user._id,
            status: "OPEN",
          },
          { new: true }
        )
          .populate("userId", "fullName avatar userName")
          .populate("adminId", "fullName avatar userName");

        // Thông báo đến tất cả admin
        io.to("admins").emit("conversation_assigned", {
          conversationId,
          adminId: user._id,
          conversation,
        });

        // Thông báo đến user qua conversation room và user room
        const userId = conversation.userId._id.toString();
        
        // Emit đến conversation room
        io.to(`conversation:${conversationId}`).emit("admin_joined", {
          conversationId,
          admin: {
            _id: user._id,
            fullName: user.fullName,
            avatar: user.avatar,
          },
        });
        
        // Emit đến user room (để user nhận được dù không join conversation room)
        io.to(userId).emit("admin_joined", {
          conversationId,
          admin: {
            _id: user._id,
            fullName: user.fullName,
            avatar: user.avatar,
          },
        });
        
        console.log(`Admin ${user.fullName} assigned to conversation ${conversationId}, notified user ${userId}`);
      } catch (error) {
        console.error("Error assigning conversation:", error);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${user.fullName}`);
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        adminSockets.delete(user._id.toString());
      } else {
        userSockets.delete(user._id.toString());
      }
    });
  });

  return io;
};

export { userSockets, adminSockets };
