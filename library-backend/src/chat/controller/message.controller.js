import Message from "../model/message.model.js";
import Conversation from "../model/conversation.model.js";

// Lấy tin nhắn của một conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ conversationId })
      .populate("senderId", "fullName avatar userName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ conversationId });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Đảo ngược để tin nhắn cũ nhất ở trên
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Gửi tin nhắn (REST API fallback)
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = "TEXT", attachmentUrl } = req.body;
    const senderId = req.user._id;
    const senderType = req.user.role;

    // Kiểm tra conversation tồn tại
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc trò chuyện",
      });
    }

    // Tạo tin nhắn mới
    const message = await Message.create({
      conversationId,
      senderId,
      senderType,
      content,
      messageType,
      attachmentUrl,
    });

    // Cập nhật conversation
    const updateData = {
      lastMessage: content,
      lastMessageAt: new Date(),
    };

    // Cập nhật số tin nhắn chưa đọc
    if (senderType === "USER") {
      updateData.unreadByAdmin = conversation.unreadByAdmin + 1;
    } else {
      updateData.unreadByUser = conversation.unreadByUser + 1;
    }

    await Conversation.findByIdAndUpdate(conversationId, updateData);

    // Populate sender info trước khi trả về
    const populatedMessage = await Message.findById(message._id).populate(
      "senderId",
      "fullName avatar userName"
    );

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Đánh dấu tin nhắn đã đọc
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Cập nhật tất cả tin nhắn chưa đọc trong conversation
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Reset unread count
    const updateData =
      userRole === "USER" ? { unreadByUser: 0 } : { unreadByAdmin: 0 };

    await Conversation.findByIdAndUpdate(conversationId, updateData);

    res.status(200).json({
      success: true,
      message: "Đã đánh dấu đọc tất cả tin nhắn",
    });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
