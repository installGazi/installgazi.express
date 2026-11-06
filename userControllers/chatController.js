import asyncHandler from "express-async-handler";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// ১. চ্যাট শুরু করা বা খুঁজে বের করা
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const populatedConv = await Conversation.findById(conversation._id).populate(
    "participants",
    "name email profilePic role"
  );

  res.status(200).json(populatedConv);
});

// ২. নির্দিষ্ট কনভার্সেশনের মেসেজগুলো আনা
export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const messages = await Message.find({ conversationId }).populate(
    "sender",
    "name profilePic"
  );
  res.status(200).json(messages);
});

// ৩. অ্যাডমিনের ডিটেইলস বের করা
export const getAdminDetails = asyncHandler(async (req, res) => {
  const admin = await User.findOne({ role: "admin" }).select("_id name");
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }
  res.status(200).json(admin);
});

// ৪. সব কনভার্সেশনের লিস্ট আনা (অ্যাডমিনের জন্য)
export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: { $in: [req.user._id] }, 
  })
    .populate("participants", "name email profilePic role") 
    .sort({ updatedAt: -1 }); 

  res.status(200).json(conversations);
});

// ৫. কনভার্সেশন ডিলিট করা (অ্যাডমিনের জন্য)
export const deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  await Message.deleteMany({ conversationId });
  await conversation.deleteOne();

  res.status(200).json({ message: "Conversation deleted successfully" });
});