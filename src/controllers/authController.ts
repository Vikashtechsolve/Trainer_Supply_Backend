import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Rate limiter for login attempts
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  message: { message: "Too many login attempts, please try again later" },
});

// Token expiration time
const TOKEN_EXPIRATION = "24h";

// Generate JWT token
const generateToken = (userId: string, role: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('JWT_SECRET is not set in environment variables');
    throw new Error('JWT configuration error');
  }

  try {
    return jwt.sign(
      { userId, role },
      secret,
      {
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRE || '24h'
      } as jwt.SignOptions
    );
  } catch (error) {
    logger.error('Error generating JWT token:', error);
    throw new Error('Token generation failed');
  }
};

export const register = async (req: Request, res: Response) => {
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
        message:
          "Password must include at least one number and one special character",
      });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      email: normalizedEmail,
      password, // Hashed in pre-save hook
      firstName,
      lastName,
      role: "user", // Default role
    });

    await user.save();

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
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    logger.log('Login attempt for email:', email);

    if (!email || !password) {
      logger.error('Login failed: Missing email or password');
      return res.status(400).json({ message: "All fields are required" });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      logger.error('Login failed: User not found for email:', normalizedEmail);
      // Use generic error message for security
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (
      user.loginAttempts >= 5 &&
      user.lockUntil &&
      user.lockUntil > Date.now()
    ) {
      logger.error('Login failed: Account locked for user:', normalizedEmail);
      return res.status(401).json({
        message: "Account is temporarily locked. Please try again later.",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account if too many attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
        logger.error('Account locked due to too many attempts for user:', normalizedEmail);
      }

      await user.save();

      logger.error('Login failed: Invalid password for user:', normalizedEmail);
      // Use generic error message for security
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = generateToken(user._id, user.role);
    logger.log('Login successful for user:', normalizedEmail);

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
  } catch (error) {
    logger.error('Login error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body
    });
    res.status(500).json({ message: "Error logging in" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({ message: "Error getting profile" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    await user.save();

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
  } catch (error) {
    logger.error("Update profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};
