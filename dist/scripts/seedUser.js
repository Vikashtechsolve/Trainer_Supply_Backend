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
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => {
    logger_1.logger.log("Connected to MongoDB");
})
    .catch((error) => {
    logger_1.logger.error("MongoDB connection error:", error);
});
const seedUser = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield User_1.User.findOne({ email: "test@example.com" });
        if (existingUser) {
            logger_1.logger.log("Test user already exists");
            return;
        }
        const user = new User_1.User({
            email: "test@example.com",
            password: "Test@123",
            firstName: "Test",
            lastName: "User",
            role: "admin",
        });
        yield user.save();
        logger_1.logger.log("Test user created successfully");
    }
    catch (error) {
        logger_1.logger.error("Error seeding user:", error);
    }
    finally {
        mongoose_1.default.disconnect();
    }
});
seedUser();
