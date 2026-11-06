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
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import logger from "./middlewares/logger.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import { setupSocket } from "./socket/socket.js";

console.log("🚀 Starting server...");
const app = express();
connectDB();
app.set("trust proxy", 1);

// =========================================
// CORS Configuration (কোডেই লিংক বসানো হলো)
// =========================================
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "https://smart-biz-suite-react-js.vercel.app" // আপনার ভেরসেলের লিংক
    ],
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
// Root Route
// =========================================
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// =========================================
// Routes Configuration
// =========================================
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/bookings", bookingRoutes);
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
const server = http.createServer(app);
setupSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready and listening`);
});