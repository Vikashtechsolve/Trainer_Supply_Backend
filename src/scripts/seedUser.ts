import mongoose from "mongoose";
import { User } from "../models/User";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    logger.log("Connected to MongoDB");
  })
  .catch((error) => {
    logger.error("MongoDB connection error:", error);
  });

const seedUser = async () => {
  try {
    const existingUser = await User.findOne({ email: "test@example.com" });
    if (existingUser) {
      logger.log("Test user already exists");
      return;
    }

    const user = new User({
      email: "test@example.com",
      password: "Test@123",
      firstName: "Test",
      lastName: "User",
      role: "admin",
    });

    await user.save();
    logger.log("Test user created successfully");
  } catch (error) {
    logger.error("Error seeding user:", error);
  } finally {
    mongoose.disconnect();
  }
};

seedUser();
