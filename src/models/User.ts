import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";
import { logger } from "../utils/logger";

export interface UserDocument extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password should be at least 8 characters long"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "user"],
      default: "user",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre<UserDocument>("save", async function (next) {
  // Only hash the password if it's modified or new
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(12);

    // Hash password with salt
    const hashedPassword = await bcrypt.hash(this.password, salt);

    // Replace plain text password with hashed password
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    logger.error("Password comparison error:", error);
    throw error;
  }
};

export const User = mongoose.model<UserDocument>("User", userSchema);
