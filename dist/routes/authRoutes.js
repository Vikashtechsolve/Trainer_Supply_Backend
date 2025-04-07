"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Validation middleware
const registerValidation = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Please enter a valid email"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("firstName").notEmpty().withMessage("First name is required"),
    (0, express_validator_1.body)("lastName").notEmpty().withMessage("Last name is required"),
    (0, express_validator_1.body)("role")
        .optional()
        .isIn(["admin", "trainer", "student"])
        .withMessage("Invalid role"),
];
const loginValidation = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Please enter a valid email"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
// Routes
router.post("/register", registerValidation, authController_1.register);
router.post("/login", loginValidation, authController_1.login);
router.get("/profile", auth_1.authenticate, authController_1.getProfile);
router.put("/profile", auth_1.authenticate, authController_1.updateProfile);
exports.default = router;
