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

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

logger.log(`Starting server in ${process.env.NODE_ENV} mode`);

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth";
import trainerRoutes from "./routes/trainerRoutes";
import courseRoutes from "./routes/courseRoutes";
import vendorRoutes from "./routes/vendorRoutes";
import userRoutes from "./routes/userRoutes";

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://trainer-supply-backend.onrender.com",
            "https://trainer-supply-frontend.vercel.app",
          ]
        : [
            "http://localhost:8080",
            "http://localhost:8081",
            "http://localhost:8082",
          ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
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
        ? [
            "https://trainer-supply-backend.onrender.com",
            "https://trainer-supply-frontend.vercel.app",
          ]
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
logger.log('Attempting to connect to MongoDB with URI:', MONGODB_URI);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    logger.error("MongoDB connection error:", error);
    process.exit(1); // Exit if we can't connect to MongoDB
  });

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
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
    logger.error('Error details:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    });
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
const PORT = parseInt(process.env.PORT || '5000', 10);
httpServer.listen(PORT, () => {
  logger.log(`Server is running on port ${PORT}`);
  logger.log(`Environment: ${process.env.NODE_ENV}`);
  logger.log(`MongoDB URI: ${process.env.MONGODB_URI?.substring(0, 20)}...`);
});
