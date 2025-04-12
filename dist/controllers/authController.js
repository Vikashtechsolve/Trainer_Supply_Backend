"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.register = exports.loginRateLimiter = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const express_rate_limit_1 = require("express-rate-limit");
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// Rate limiter for login attempts
exports.loginRateLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    standardHeaders: true,
    message: { message: "Too many login attempts, please try again later" },
});
// Token expiration time
const TOKEN_EXPIRATION = "24h";
// Generate JWT token
const generateToken = (userId, role) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        logger_1.logger.error('JWT_SECRET is not set in environment variables');
        throw new Error('JWT configuration error');
    }
    try {
        return jsonwebtoken_1.default.sign({ userId, role }, secret, {
            algorithm: 'HS256',
            expiresIn: process.env.JWT_EXPIRE || '24h'
        });
    }
    catch (error) {
        logger_1.logger.error('Error generating JWT token:', error);
        throw new Error('Token generation failed');
    }
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, firstName, lastName } = req.body;
        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long",
            });
        }
        // Check for at least one number and one special character
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (!hasNumber || !hasSpecial) {
            return res.status(400).json({
                message: "Password must include at least one number and one special character",
            });
        }
        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase();
        // Check if user already exists
        const existingUser = yield User_1.User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Create new user
        const user = new User_1.User({
            email: normalizedEmail,
            password, // Hashed in pre-save hook
            firstName,
            lastName,
            role: "user", // Default role
        });
        yield user.save();
        // Generate JWT
        const token = generateToken(user._id, user.role);
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Registration error:", error);
        res.status(500).json({ message: "Error registering user" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        logger_1.logger.log('Login attempt for email:', email);
        if (!email || !password) {
            logger_1.logger.error('Login failed: Missing email or password');
            return res.status(400).json({ message: "All fields are required" });
        }
        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase();
        // Find user by email
        const user = yield User_1.User.findOne({ email: normalizedEmail });
        if (!user) {
            logger_1.logger.error('Login failed: User not found for email:', normalizedEmail);
            // Use generic error message for security
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Check if account is locked
        if (user.loginAttempts >= 5 &&
            user.lockUntil &&
            user.lockUntil > Date.now()) {
            logger_1.logger.error('Login failed: Account locked for user:', normalizedEmail);
            return res.status(401).json({
                message: "Account is temporarily locked. Please try again later.",
            });
        }
        // Compare password
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            // Increment login attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            // Lock account if too many attempts
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
                logger_1.logger.error('Account locked due to too many attempts for user:', normalizedEmail);
            }
            yield user.save();
            logger_1.logger.error('Login failed: Invalid password for user:', normalizedEmail);
            // Use generic error message for security
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.lastLogin = new Date();
        yield user.save();
        // Generate JWT
        const token = generateToken(user._id, user.role);
        logger_1.logger.log('Login successful for user:', normalizedEmail);
        // Send JWT token
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            body: req.body
        });
        res.status(500).json({ message: "Error logging in" });
    }
});
exports.login = login;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        logger_1.logger.error("Get profile error:", error);
        res.status(500).json({ message: "Error getting profile" });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email } = req.body;
        const user = yield User_1.User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Update fields
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (email)
            user.email = email;
        yield user.save();
        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Update profile error:", error);
        res.status(500).json({ message: "Error updating profile" });
    }
});
exports.updateProfile = updateProfile;
