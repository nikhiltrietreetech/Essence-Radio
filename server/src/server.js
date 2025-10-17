import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB, sequelize } from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";
import { setupSignaling } from "./services/signalingService.js";
import Chat from "./models/Chat.js";
import StreamSession from "./models/StreamSession.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/chat", chatRoutes);
app.use("/api/stream", streamRoutes);

// HTTP + Socket.io server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Setup WebRTC signaling
setupSignaling(io);

// DB connect and sync
connectDB();
sequelize.sync({ alter: true }).then(() => console.log("📦 Tables synced"));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
