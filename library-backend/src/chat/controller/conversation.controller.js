import Conversation from "../model/conversation.model.js";
import Message from "../model/message.model.js";

// Lấy hoặc tạo conversation cho user
export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user._id;

    // Tìm conversation đang mở của user
    let conversation = await Conversation.findOne({
      userId,
      status: { $in: ["OPEN", "PENDING"] },
    })
      .populate("userId", "fullName avatar userName")
      .populate("adminId", "fullName avatar userName");

    // Nếu chưa có thì tạo mới
    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        status: "PENDING",
      });
      conversation = await Conversation.findById(conversation._id)
        .populate("userId", "fullName avatar userName")
        .populate("adminId", "fullName avatar userName");
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Admin lấy danh sách tất cả conversations
export const getAllConversations = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const conversations = await Conversation.find(query)
      .populate("userId", "fullName avatar userName email")
      .populate("adminId", "fullName avatar userName")
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Conversation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllConversations:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Admin nhận conversation
export const assignConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const adminId = req.user._id;

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        adminId,
        status: "OPEN",
      },
      { new: true }
    )
      .populate("userId", "fullName avatar userName")
      .populate("adminId", "fullName avatar userName");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc trò chuyện",
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error in assignConversation:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Đóng conversation
export const closeConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { status: "CLOSED" },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc trò chuyện",
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error in closeConversation:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Lấy conversation by ID
export const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate("userId", "fullName avatar userName email")
      .populate("adminId", "fullName avatar userName");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc trò chuyện",
      });
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error in getConversationById:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
