"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.post("/register", authController_1.register);
router.post("/login", authController_1.loginRateLimiter, authController_1.login);
// Protected routes
router.get("/profile", auth_1.authenticate, userController_1.getUserProfile);
router.put("/settings", auth_1.authenticate, userController_1.updateUserSettings);
exports.default = router;
