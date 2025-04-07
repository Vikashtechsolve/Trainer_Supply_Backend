"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// Authenticate middleware to verify JWT
const authenticate = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res
                .status(401)
                .json({ message: "No authentication token, access denied" });
        }
        // Check if Bearer token format
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res
                .status(401)
                .json({ message: "Authorization format must be Bearer <token>" });
        }
        const token = parts[1];
        const secret = process.env.JWT_SECRET || "default_jwt_secret";
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            // Check token expiration explicitly
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < currentTime) {
                return res.status(401).json({ message: "Token has expired" });
            }
            // Set user data to request object
            req.user = decoded;
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json({ message: "Invalid token" });
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res.status(401).json({ message: "Token has expired" });
            }
            return res.status(401).json({ message: "Token verification failed" });
        }
    }
    catch (error) {
        logger_1.logger.error("Authentication error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.authenticate = authenticate;
// Authorize middleware to check user roles
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You don't have permission to access this resource",
            });
        }
        next();
    };
};
exports.authorize = authorize;
