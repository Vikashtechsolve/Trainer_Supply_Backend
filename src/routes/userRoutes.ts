import express from "express";
import {
  login,
  register,
  loginRateLimiter,
} from "../controllers/authController";
import {
  getUserProfile,
  updateUserSettings,
} from "../controllers/userController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", loginRateLimiter, login);

// Protected routes
router.get("/profile", authenticate, getUserProfile);
router.put("/settings", authenticate, updateUserSettings);

export default router;
