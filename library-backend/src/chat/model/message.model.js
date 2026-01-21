import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    // Cuộc trò chuyện chứa tin nhắn này
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    // Người gửi
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Loại người gửi
    senderType: {
      type: String,
      enum: ["USER", "ADMIN", "SUPER_ADMIN"],
      required: true,
    },
    // Nội dung tin nhắn
    content: {
      type: String,
      required: true,
    },
    // Loại tin nhắn
    messageType: {
      type: String,
      enum: ["TEXT", "IMAGE", "FILE", "SYSTEM"],
      default: "TEXT",
    },
    // URL file/ảnh nếu có
    attachmentUrl: {
      type: String,
      default: null,
    },
    // Trạng thái đã đọc
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index để query tin nhắn theo thời gian
messageSchema.index({ conversationId: 1, createdAt: -1 });

export default model("Message", messageSchema);
