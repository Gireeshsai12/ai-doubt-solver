import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getChats,
  createChat,
  getMessages,
  sendMessage,
  deleteChat,
  renameChat,
  toggleFavoriteChat,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/", protect, getChats);
router.post("/", protect, createChat);
router.get("/:chatId", protect, getMessages);
router.post("/:chatId", protect, sendMessage);
router.delete("/:chatId", protect, deleteChat);
router.patch("/:chatId/rename", protect, renameChat);
router.patch("/:chatId/favorite", protect, toggleFavoriteChat);

export default router;