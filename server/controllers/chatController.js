import { GoogleGenAI } from "@google/genai";
import Chat from "../models/Chat.js";

const buildPrompt = (message, subject = "General") => {
  const baseRules = `
You are an AI doubt solver for students.

Rules:
- Keep answers simple and clear
- 4 to 8 lines max
- Use beginner-friendly language
- Be direct and helpful
`;

  const subjectRules = {
    DSA: "Focus on data structures, algorithms, examples, time complexity, and simple explanations.",
    DBMS: "Focus on database concepts, SQL, normalization, keys, transactions, and simple definitions.",
    OS: "Focus on operating system concepts like processes, threads, scheduling, memory, and synchronization.",
    OOP: "Focus on classes, objects, inheritance, polymorphism, abstraction, and encapsulation.",
    CN: "Focus on computer networks, protocols, OSI model, TCP/IP, routing, switching, and communication basics.",
    General: "Explain in a simple student-friendly way.",
  };

  return `
${baseRules}

Subject Mode: ${subject}
Instruction: ${subjectRules[subject] || subjectRules.General}

User question:
${message}
`;
};

const getAIReply = async (message, subject = "General") => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = buildPrompt(message, subject);

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  return (
    response?.text || "I'm having trouble answering right now. Please try again."
  );
};

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    const chatsWithPreview = chats.map((chat) => {
      const lastMessage =
        chat.messages && chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1]
          : null;

      return {
        _id: chat._id,
        title: chat.title,
        updatedAt: chat.updatedAt,
        isFavorite: !!chat.isFavorite,
        lastMessage: lastMessage?.text || "No messages yet",
        lastTime: lastMessage?.createdAt || chat.updatedAt,
      };
    });

    res.json({ chats: chatsWithPreview });
  } catch (error) {
    console.error("Get Chats Error:", error);
    res.status(500).json({ msg: "Failed to load chats" });
  }
};

export const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      user: req.user.id,
      title: "New Chat",
      messages: [],
      isFavorite: false,
    });

    res.status(201).json({ chat });
  } catch (error) {
    console.error("Create Chat Error:", error);
    res.status(500).json({ msg: "Failed to create chat" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ msg: "Chat not found" });
    }

    res.json({
      messages: chat.messages,
      title: chat.title,
      isFavorite: chat.isFavorite,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ msg: "Failed to load chat history" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message, subject } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ msg: "Message is required" });
    }

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ msg: "Chat not found" });
    }

    const trimmedMessage = message.trim();
    const safeSubject = subject || "General";

    const userMessage = {
      sender: "user",
      text: trimmedMessage,
    };

    chat.messages.push(userMessage);

    if (chat.title === "New Chat") {
      chat.title = trimmedMessage.slice(0, 40);
    }

    let aiReply;

    try {
      aiReply = await getAIReply(trimmedMessage, safeSubject);
    } catch (error) {
      console.error("AI Error:", error);
      aiReply = "Something went wrong while generating the response.";
    }

    const aiMessage = {
      sender: "ai",
      text: aiReply,
    };

    chat.messages.push(aiMessage);
    await chat.save();

    res.json({
      userMessage: chat.messages[chat.messages.length - 2],
      aiMessage: chat.messages[chat.messages.length - 1],
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({
      msg: "Failed to send message",
    });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ msg: "Chat not found" });
    }

    res.json({ msg: "Chat deleted successfully" });
  } catch (error) {
    console.error("Delete Chat Error:", error);
    res.status(500).json({ msg: "Failed to delete chat" });
  }
};

export const renameChat = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ msg: "Title is required" });
    }

    const chat = await Chat.findOneAndUpdate(
      {
        _id: req.params.chatId,
        user: req.user.id,
      },
      {
        title: title.trim().slice(0, 60),
      },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ msg: "Chat not found" });
    }

    res.json({
      msg: "Chat renamed successfully",
      chat: {
        _id: chat._id,
        title: chat.title,
      },
    });
  } catch (error) {
    console.error("Rename Chat Error:", error);
    res.status(500).json({ msg: "Failed to rename chat" });
  }
};

export const toggleFavoriteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({ msg: "Chat not found" });
    }

    chat.isFavorite = !chat.isFavorite;
    await chat.save();

    res.json({
      msg: "Favorite status updated",
      chat: {
        _id: chat._id,
        isFavorite: chat.isFavorite,
      },
    });
  } catch (error) {
    console.error("Toggle Favorite Error:", error);
    res.status(500).json({ msg: "Failed to update favorite status" });
  }
};