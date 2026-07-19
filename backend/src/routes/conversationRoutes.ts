import { Router } from "express";
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markRead,
  clearChat,
} from "../controllers/conversationController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", getConversations);
router.post("/", createConversation);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", sendMessage);
router.post("/:id/read", markRead);
router.delete("/:id/messages", clearChat);

export default router;
