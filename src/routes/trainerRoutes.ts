import express from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import path from "path";
import {
  getAllTrainers,
  getTrainer,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  updateAvailability,
  updateDocuments,
  updateInterviewStatus,
} from "../controllers/trainerController";
import { auth, authorize } from "../middleware/auth";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed!"));
    }
  },
});

// Validation middleware
const trainerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("phoneNo").notEmpty().withMessage("Phone number is required"),
  body("qualification").notEmpty().withMessage("Qualification is required"),
  body("passingYear").notEmpty().withMessage("Passing year is required"),
  body("expertise").notEmpty().withMessage("Expertise is required"),
  body("teachingExperience")
    .notEmpty()
    .withMessage("Teaching experience is required"),
  body("developmentExperience")
    .notEmpty()
    .withMessage("Development experience is required"),
  body("totalExperience")
    .notEmpty()
    .withMessage("Total experience is required"),
  body("feasibleTime").notEmpty().withMessage("Feasible time is required"),
  body("payoutExpectation")
    .notEmpty()
    .withMessage("Payout expectation is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("remarks").optional().isString(),
];

const availabilityValidation = [
  body("availability").isArray().withMessage("Availability must be an array"),
  body("availability.*.day")
    .isIn([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ])
    .withMessage("Invalid day"),
  body("availability.*.slots").isArray().withMessage("Slots must be an array"),
];

const documentsValidation = [
  body("documents").isArray().withMessage("Documents must be an array"),
  body("documents.*.type").notEmpty().withMessage("Document type is required"),
  body("documents.*.url").isURL().withMessage("Invalid document URL"),
];

// Routes
router.get("/", getAllTrainers);
router.get("/:id", getTrainer);

//Interview route
router.put(
  "/:id/interview",
  auth,
  authorize("admin"),
  body("interview").isIn(["Taken", "Not taken"]),
  updateInterviewStatus
);

// Create trainer route without authentication
router.post("/", upload.single("resume"), async (req, res, next) => {
  try {
    await createTrainer(req, res);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: "An unknown error occurred" });
    }
  }
});

// Protected routes (require authentication)
router.put(
  "/:id",
  auth,
  authorize("admin", "trainer"),
  trainerValidation,
  updateTrainer
);
router.delete("/:id", auth, authorize("admin"), deleteTrainer);
router.put(
  "/:id/availability",
  auth,
  authorize("admin", "trainer"),
  updateAvailability
);
router.put(
  "/:id/documents",
  auth,
  authorize("admin", "trainer"),
  upload.array("document", 5),
  updateDocuments
);

export default router;
