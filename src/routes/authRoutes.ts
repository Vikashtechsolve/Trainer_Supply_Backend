import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Validation middleware
const registerValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("role")
    .optional()
    .isIn(["admin", "trainer", "student"])
    .withMessage("Invalid role"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

export default router;
