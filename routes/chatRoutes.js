import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { 
  getOrCreateConversation, 
  getMessages,
  getAdminDetails, 
  getConversations,
  deleteConversation
} from "../userControllers/chatController.js";

const router = express.Router();

router.post("/conversation", protect, getOrCreateConversation);
router.get("/messages/:conversationId", protect, getMessages);
router.get("/admin-details", protect, getAdminDetails); 
router.get("/conversations", protect, getConversations); 

// ডিলিট রাউট
router.delete("/conversation/:conversationId", protect, adminMiddleware, deleteConversation);

export default router;