import express from "express";
import { body } from "express-validator";
import {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  updateMaterials,
  updateSchedule,
} from "../controllers/courseController";
import { authenticate as auth, authorize } from "../middleware/auth";

const router = express.Router();

// Validation middleware
const courseValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("duration")
    .isInt({ min: 0 })
    .withMessage("Duration must be a positive number"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("trainerId").isMongoId().withMessage("Invalid trainer ID"),
  body("category").notEmpty().withMessage("Category is required"),
  body("prerequisites").isArray().withMessage("Prerequisites must be an array"),
  body("objectives").isArray().withMessage("Objectives must be an array"),
];

const scheduleValidation = [
  body("schedule").isArray().withMessage("Schedule must be an array"),
  body("schedule.*.date").isISO8601().withMessage("Invalid date format"),
  body("schedule.*.time")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format"),
  body("schedule.*.duration")
    .isInt({ min: 0 })
    .withMessage("Duration must be a positive number"),
];

const materialsValidation = [
  body("materials").isArray().withMessage("Materials must be an array"),
  body("materials.*.title")
    .notEmpty()
    .withMessage("Material title is required"),
  body("materials.*.url").isURL().withMessage("Invalid material URL"),
];

// Routes
router.get("/", getAllCourses);
router.get("/:id", getCourse);

// Protected routes (require authentication)
router.post(
  "/",
  auth,
  authorize(["admin", "trainer"]),
  courseValidation,
  createCourse
);
router.put(
  "/:id",
  auth,
  authorize(["admin", "trainer"]),
  courseValidation,
  updateCourse
);
router.delete("/:id", auth, authorize(["admin"]), deleteCourse);
router.put(
  "/:id/materials",
  auth,
  authorize(["admin", "trainer"]),
  materialsValidation,
  updateMaterials
);
router.put(
  "/:id/schedule",
  auth,
  authorize(["admin", "trainer"]),
  scheduleValidation,
  updateSchedule
);

export default router;
