import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(socket.userId); // ইউজারের নিজের রুম

    socket.on("sendMessage", async (data) => {
      try {
        const { conversationId, text, receiverId } = data;
        
        // ১. ডেটাবেসে মেসেজ সেভ
        const newMessage = await Message.create({
          conversationId,
          sender: socket.userId,
          text,
        });

        const populatedMessage = await Message.findById(newMessage._id).populate("sender", "name profilePic");

        // ২. কনভার্সেশনের লাস্ট মেসেজ আপডেট
        await Conversation.findByIdAndUpdate(conversationId, { lastMessage: text });

        // ৩. রিসিভার এবং সেন্ডার দুইজনকেই ইভেন্ট পাঠানো
        io.to(receiverId).emit("receiveMessage", populatedMessage);
        socket.emit("messageSent", populatedMessage);

      } catch (error) {
        console.error("Socket message error:", error);
      }
    });
  });
};