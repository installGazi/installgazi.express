import dotenv from "dotenv";
dotenv.config();

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http"; // নতুন ইমপোর্ট (Socket.io এর জন্য)
import { Server } from "socket.io"; // নতুন ইমপোর্ট
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js"; // নতুন চ্যাট রাউট
import bookingRoutes from "./routes/bookingRoutes.js"; // ⬅️ নতুন বুকিং রাউট
import logger from "./middlewares/logger.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import { setupSocket } from "./socket/socket.js"; // নতুন সকেট হ্যান্ডলার

console.log("🚀 Starting server...");
const app = express();
connectDB();
app.set("trust proxy", 1);

// =========================================
// CORS Configuration
// =========================================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

console.log("✅ CORS configured");

// =========================================
// Middleware Setup
// =========================================
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
console.log("✅ Middleware configured");

// =========================================
// Cloudinary Status Check
// =========================================
console.log("🔍 Cloudinary Status:");
console.log(`  Name: ${process.env.CLOUDINARY_CLOUD_NAME || "❌ Not set"}`);
console.log(`  Key: ${process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing"}`);
console.log(`  Secret: ${process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing"}`);

// =========================================
// Root Route
// =========================================
app.get("/", (req, res) => {
  console.log("🏠 Root endpoint hit");
  res.send("🚀 API is running...");
});

// =========================================
// Routes Configuration
// =========================================
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes); // চ্যাট রাউট যুক্ত করা হলো
app.use("/api/bookings", bookingRoutes); // ⬅️ বুকিং রাউট যুক্ত করা হলো
console.log("✅ Routes configured");

// =========================================
// Error Handling
// =========================================
app.use(notFound);
app.use(errorHandler);

// =========================================
// HTTP Server & Socket.io Setup
// =========================================
const PORT = process.env.PORT || 5000;

// Express app কে HTTP server-এ র‍্যাপ করা হলো
const server = http.createServer(app);

// Socket.io সেটআপ ফাংশন কল করা হলো
setupSocket(server);

// সার্ভার স্টার্ট
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready and listening`);
});