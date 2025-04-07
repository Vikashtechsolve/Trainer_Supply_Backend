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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.updateUserSettings = void 0;
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const updateUserSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, firstName, lastName, currentPassword, newPassword } = req.body;
        const userId = req.user.userId;
        // Validate request data
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Find user
        const user = yield User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Track if any changes were made
        let changesApplied = false;
        // Update first name if provided
        if (firstName && firstName !== user.firstName) {
            // Basic validation
            if (firstName.trim().length < 2) {
                return res
                    .status(400)
                    .json({ message: "First name must be at least 2 characters" });
            }
            user.firstName = firstName.trim();
            changesApplied = true;
        }
        // Update last name if provided
        if (lastName && lastName !== user.lastName) {
            // Basic validation
            if (lastName.trim().length < 2) {
                return res
                    .status(400)
                    .json({ message: "Last name must be at least 2 characters" });
            }
            user.lastName = lastName.trim();
            changesApplied = true;
        }
        // If trying to change password
        if (currentPassword && newPassword) {
            // Password must be at least 6 characters
            if (newPassword.length < 6) {
                return res.status(400).json({
                    message: "New password must be at least 6 characters long",
                });
            }
            // Verify current password
            const isMatch = yield user.comparePassword(currentPassword);
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: "Current password is incorrect" });
            }
            // Update password
            user.password = newPassword;
            changesApplied = true;
        }
        else if ((currentPassword && !newPassword) ||
            (!currentPassword && newPassword)) {
            // Both or neither password fields should be provided
            return res.status(400).json({
                message: "Both current password and new password are required to update password",
            });
        }
        // If trying to change email
        if (email && email !== user.email) {
            // Basic email validation
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            // Check if email is already taken by a DIFFERENT user
            const existingUser = yield User_1.User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            // Update email
            user.email = email;
            changesApplied = true;
        }
        if (!changesApplied) {
            return res.status(400).json({ message: "No changes to apply" });
        }
        // Save changes
        yield user.save();
        // Return updated user info
        res.json({
            message: "Settings updated successfully",
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
        logger_1.logger.error("Update settings error:", error);
        res.status(500).json({ message: "Error updating settings" });
    }
});
exports.updateUserSettings = updateUserSettings;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const user = yield User_1.User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                lastLogin: user.lastLogin,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Get profile error:", error);
        res.status(500).json({ message: "Error getting profile" });
    }
});
exports.getUserProfile = getUserProfile;
