import { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    // User (client) tham gia cuộc trò chuyện
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Admin đang xử lý (có thể null nếu chưa có admin nào nhận)
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Trạng thái cuộc trò chuyện
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "PENDING"],
      default: "OPEN",
    },
    // Tin nhắn cuối cùng để hiển thị preview
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    // Số tin nhắn chưa đọc
    unreadByUser: {
      type: Number,
      default: 0,
    },
    unreadByAdmin: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh
conversationSchema.index({ userId: 1 });
conversationSchema.index({ adminId: 1 });
conversationSchema.index({ status: 1 });

export default model("Conversation", conversationSchema);
