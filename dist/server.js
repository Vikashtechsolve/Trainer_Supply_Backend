"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("./utils/logger");
// Load environment variables
dotenv_1.default.config();
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const trainerRoutes_1 = __importDefault(require("./routes/trainerRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const vendorRoutes_1 = __importDefault(require("./routes/vendorRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// Create Express app
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.NODE_ENV === "production"
            ? "https://trainer-management-system-frontend.onrender.com"
            : "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(__dirname, "../public/uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production"
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
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../public/uploads")));
// Database connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    logger_1.logger.log("Connected to MongoDB");
})
    .catch((error) => {
    logger_1.logger.error("MongoDB connection error:", error);
});
// Socket.IO connection handling
io.on("connection", (socket) => {
    logger_1.logger.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
        logger_1.logger.log("Client disconnected:", socket.id);
    });
});
// Routes
app.use("/api/auth", auth_1.default);
app.use("/api/trainers", trainerRoutes_1.default);
app.use("/api/courses", courseRoutes_1.default);
app.use("/api/vendors", vendorRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
// Base route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Trainer Management System API" });
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.logger.error(err.stack);
    res.status(500).json({
        message: "Something went wrong!",
        error: err.message,
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    logger_1.logger.log(`Server is running on port ${PORT}`);
});
