import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import { logger } from "./utils/logger";

// Import routes
import authRoutes from "./routes/auth";
import trainerRoutes from "./routes/trainerRoutes";
import courseRoutes from "./routes/courseRoutes";
import vendorRoutes from "./routes/vendorRoutes";
import userRoutes from "./routes/userRoutes";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://trainer-management-system-frontend.onrender.com"
        : "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://trainer-management-system-frontend.onrender.com"
        : [
            "http://localhost:8080",
            "http://localhost:8081",
            "http://localhost:8082",
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI as string;
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.log("Connected to MongoDB");
  })
  .catch((error) => {
    logger.error("MongoDB connection error:", error);
  });

// Socket.IO connection handling
io.on("connection", (socket) => {
  logger.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    logger.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/users", userRoutes);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Trainer Management System API" });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(err.stack);
    res.status(500).json({
      message: "Something went wrong!",
      error: err.message,
    });
  }
);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.log(`Server is running on port ${PORT}`);
});
