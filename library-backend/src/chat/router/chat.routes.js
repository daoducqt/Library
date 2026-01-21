import express from "express";
import {
  getOrCreateConversation,
  getAllConversations,
  assignConversation,
  closeConversation,
  getConversationById,
} from "../controller/conversation.controller.js";
import {
  getMessages,
  sendMessage,
  markAsRead,
} from "../controller/message.controller.js";
import authMiddleware from "../../../core/middleware/authentication.js";

const router = express.Router();

const { verifyToken, verifyRole } = authMiddleware;

// User routes
router.get("/my-conversation", verifyToken, getOrCreateConversation);

// Admin routes
router.get("/conversations", verifyToken, verifyRole("ADMIN", "SUPER_ADMIN"), getAllConversations);
router.post("/conversations/:conversationId/assign", verifyToken, verifyRole("ADMIN", "SUPER_ADMIN"), assignConversation);
router.post("/conversations/:conversationId/close", verifyToken, verifyRole("ADMIN", "SUPER_ADMIN"), closeConversation);

// Common routes (cả user và admin)
router.get("/conversations/:conversationId", verifyToken, getConversationById);
router.get("/conversations/:conversationId/messages", verifyToken, getMessages);
router.post("/conversations/:conversationId/messages", verifyToken, sendMessage);
router.post("/conversations/:conversationId/read", verifyToken, markAsRead);

export default router;
