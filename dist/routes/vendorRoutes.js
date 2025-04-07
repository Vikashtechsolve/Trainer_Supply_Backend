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
const vendorController_1 = require("../controllers/vendorController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Validation middleware
const vendorValidation = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("company").notEmpty().withMessage("Company is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Please enter a valid email"),
    (0, express_validator_1.body)("phoneNo").notEmpty().withMessage("Phone number is required"),
    (0, express_validator_1.body)("pastRelationship")
        .notEmpty()
        .withMessage("Past relationship is required"),
    (0, express_validator_1.body)("contactPersonPosition")
        .notEmpty()
        .withMessage("Contact person position is required"),
    (0, express_validator_1.body)("location").notEmpty().withMessage("Location is required"),
    (0, express_validator_1.body)("link").optional().isString(),
    (0, express_validator_1.body)("trainerSupplied").optional().isArray(),
    (0, express_validator_1.body)("status").optional().isString(),
];
// Routes
router.get("/", vendorController_1.getAllVendors);
router.get("/:id", vendorController_1.getVendor);
// Create vendor route
router.post("/", vendorValidation, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, vendorController_1.createVendor)(req, res);
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
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)(["admin"]), vendorValidation, vendorController_1.updateVendor);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)(["admin"]), vendorController_1.deleteVendor);
// Update vendor status route
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)(["admin"]), (0, express_validator_1.body)("status").notEmpty().withMessage("Status is required").isString(), vendorController_1.updateVendorStatus);
exports.default = router;
