"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Validation middleware
const courseValidation = [
    (0, express_validator_1.body)("title").notEmpty().withMessage("Title is required"),
    (0, express_validator_1.body)("description").notEmpty().withMessage("Description is required"),
    (0, express_validator_1.body)("duration")
        .isInt({ min: 0 })
        .withMessage("Duration must be a positive number"),
    (0, express_validator_1.body)("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    (0, express_validator_1.body)("trainerId").isMongoId().withMessage("Invalid trainer ID"),
    (0, express_validator_1.body)("category").notEmpty().withMessage("Category is required"),
    (0, express_validator_1.body)("prerequisites").isArray().withMessage("Prerequisites must be an array"),
    (0, express_validator_1.body)("objectives").isArray().withMessage("Objectives must be an array"),
];
const scheduleValidation = [
    (0, express_validator_1.body)("schedule").isArray().withMessage("Schedule must be an array"),
    (0, express_validator_1.body)("schedule.*.date").isISO8601().withMessage("Invalid date format"),
    (0, express_validator_1.body)("schedule.*.time")
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage("Invalid time format"),
    (0, express_validator_1.body)("schedule.*.duration")
        .isInt({ min: 0 })
        .withMessage("Duration must be a positive number"),
];
const materialsValidation = [
    (0, express_validator_1.body)("materials").isArray().withMessage("Materials must be an array"),
    (0, express_validator_1.body)("materials.*.title")
        .notEmpty()
        .withMessage("Material title is required"),
    (0, express_validator_1.body)("materials.*.url").isURL().withMessage("Invalid material URL"),
];
// Routes
router.get("/", courseController_1.getAllCourses);
router.get("/:id", courseController_1.getCourse);
// Protected routes (require authentication)
router.post("/", auth_1.authenticate, (0, auth_1.authorize)(["admin", "trainer"]), courseValidation, courseController_1.createCourse);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)(["admin", "trainer"]), courseValidation, courseController_1.updateCourse);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)(["admin"]), courseController_1.deleteCourse);
router.put("/:id/materials", auth_1.authenticate, (0, auth_1.authorize)(["admin", "trainer"]), materialsValidation, courseController_1.updateMaterials);
router.put("/:id/schedule", auth_1.authenticate, (0, auth_1.authorize)(["admin", "trainer"]), scheduleValidation, courseController_1.updateSchedule);
exports.default = router;
