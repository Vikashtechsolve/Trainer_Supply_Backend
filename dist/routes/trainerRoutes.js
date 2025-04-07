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
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const trainerController_1 = require("../controllers/trainerController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Configure multer for file upload
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, "../../public/uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        else {
            cb(new Error("Only PDF, DOC, and DOCX files are allowed!"));
        }
    },
});
// Validation middleware
const trainerValidation = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Please enter a valid email"),
    (0, express_validator_1.body)("phoneNo").notEmpty().withMessage("Phone number is required"),
    (0, express_validator_1.body)("qualification").notEmpty().withMessage("Qualification is required"),
    (0, express_validator_1.body)("passingYear").notEmpty().withMessage("Passing year is required"),
    (0, express_validator_1.body)("expertise").notEmpty().withMessage("Expertise is required"),
    (0, express_validator_1.body)("teachingExperience")
        .notEmpty()
        .withMessage("Teaching experience is required"),
    (0, express_validator_1.body)("developmentExperience")
        .notEmpty()
        .withMessage("Development experience is required"),
    (0, express_validator_1.body)("totalExperience")
        .notEmpty()
        .withMessage("Total experience is required"),
    (0, express_validator_1.body)("feasibleTime").notEmpty().withMessage("Feasible time is required"),
    (0, express_validator_1.body)("payoutExpectation")
        .notEmpty()
        .withMessage("Payout expectation is required"),
    (0, express_validator_1.body)("location").notEmpty().withMessage("Location is required"),
    (0, express_validator_1.body)("remarks").optional().isString(),
];
const availabilityValidation = [
    (0, express_validator_1.body)("availability").isArray().withMessage("Availability must be an array"),
    (0, express_validator_1.body)("availability.*.day")
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
    (0, express_validator_1.body)("availability.*.slots").isArray().withMessage("Slots must be an array"),
];
const documentsValidation = [
    (0, express_validator_1.body)("documents").isArray().withMessage("Documents must be an array"),
    (0, express_validator_1.body)("documents.*.type").notEmpty().withMessage("Document type is required"),
    (0, express_validator_1.body)("documents.*.url").isURL().withMessage("Invalid document URL"),
];
// Routes
router.get("/", trainerController_1.getAllTrainers);
router.get("/:id", trainerController_1.getTrainer);
//Interview route
router.put("/:id/interview", auth_1.authenticate, (0, auth_1.authorize)(["admin"]), (0, express_validator_1.body)("interview").isIn(["Taken", "Not taken"]), trainerController_1.updateInterviewStatus);
// Create trainer route without authentication
router.post("/", upload.single("resume"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, trainerController_1.createTrainer)(req, res);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(400).json({ message: "An unknown error occurred" });
        }
    }
}));
// Protected routes (require authentication)
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)(["admin", "trainer"]), trainerValidation, trainerController_1.updateTrainer);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)(["admin"]), trainerController_1.deleteTrainer);
router.put("/:id/availability", auth_1.authenticate, (0, auth_1.authorize)(["admin", "trainer"]), availabilityValidation, trainerController_1.updateAvailability);
router.put("/:id/documents", auth_1.authenticate, (0, auth_1.authorize)(["admin", "trainer"]), upload.array("document", 5), trainerController_1.updateDocuments);
// Update trainer status route
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)(["admin"]), (0, express_validator_1.body)("status")
    .isIn(["Selected", "Rejected", "Pending"])
    .withMessage("Invalid status"), trainerController_1.updateTrainerStatus);
exports.default = router;
