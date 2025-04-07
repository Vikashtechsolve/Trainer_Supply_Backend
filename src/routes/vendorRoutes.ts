import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import {
  getAllVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  updateVendorStatus,
} from "../controllers/vendorController";
import { authenticate as auth, authorize } from "../middleware/auth";

const router = express.Router();

// Validation middleware
const vendorValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("company").notEmpty().withMessage("Company is required"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("phoneNo").notEmpty().withMessage("Phone number is required"),
  body("pastRelationship")
    .notEmpty()
    .withMessage("Past relationship is required"),
  body("contactPersonPosition")
    .notEmpty()
    .withMessage("Contact person position is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("link").optional().isString(),
  body("trainerSupplied").optional().isArray(),
  body("status").optional().isString(),
];

// Routes
router.get("/", getAllVendors);
router.get("/:id", getVendor);

// Create vendor route
router.post(
  "/",
  vendorValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await createVendor(req, res);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unknown error occurred" });
      }
    }
  }
);

// Protected routes (require authentication)
router.put("/:id", auth, authorize(["admin"]), vendorValidation, updateVendor);
router.delete("/:id", auth, authorize(["admin"]), deleteVendor);

// Update vendor status route
router.patch(
  "/:id/status",
  auth,
  authorize(["admin"]),
  body("status").notEmpty().withMessage("Status is required").isString(),
  updateVendorStatus
);

export default router;
