import { Request, Response } from "express";
import { Vendor } from "../models/Vendor";
import { validationResult } from "express-validator";
import { logger } from "../utils/logger";

// Get all vendors
export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find().select("-__v");
    res.json(vendors);
  } catch (error) {
    logger.error("Get vendors error:", error);
    res.status(500).json({ message: "Error getting vendors" });
  }
};

// Get single vendor
export const getVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select("-__v");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(vendor);
  } catch (error) {
    logger.error("Get vendor error:", error);
    res.status(500).json({ message: "Error getting vendor" });
  }
};

// Create vendor
export const createVendor = async (req: Request, res: Response) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.log("Validation errors during vendor creation");
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({
      $or: [
        { email: req.body.email.toLowerCase() },
        { company: req.body.company },
      ],
    });
    if (existingVendor) {
      return res.status(400).json({
        message: "Vendor with this email or company name already exists",
      });
    }

    // Create vendor
    const vendor = await Vendor.create({
      ...req.body,
      email: req.body.email.toLowerCase(),
    });

    res.status(201).json(vendor);
  } catch (error) {
    logger.error("Error in createVendor:", error);
    res.status(500).json({ message: "Error creating vendor" });
  }
};

// Update vendor
export const updateVendor = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Update fields
    const updateData = {
      name: req.body.name || vendor.name,
      company: req.body.company || vendor.company,
      email: req.body.email ? req.body.email.toLowerCase() : vendor.email,
      phoneNo: req.body.phoneNo || vendor.phoneNo,
      pastRelationship: req.body.pastRelationship || vendor.pastRelationship,
      link: req.body.link || vendor.link,
      contactPersonPosition:
        req.body.contactPersonPosition || vendor.contactPersonPosition,
      status: req.body.status || vendor.status,
      trainerSupplied: req.body.trainerSupplied || vendor.trainerSupplied,
      location: req.body.location || vendor.location,
    };

    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      message: "Vendor updated successfully",
      vendor: updatedVendor,
    });
  } catch (error) {
    logger.error("Update vendor error:", error);
    res.status(500).json({ message: "Error updating vendor" });
  }
};

// Delete vendor
export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await Vendor.findByIdAndDelete(req.params.id);
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    logger.error("Delete vendor error:", error);
    res.status(500).json({ message: "Error deleting vendor" });
  }
};

// Update vendor status
export const updateVendorStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.status = status;
    await vendor.save();

    res.json({
      message: "Vendor status updated successfully",
      vendor,
    });
  } catch (error) {
    logger.error("Update vendor status error:", error);
    res.status(500).json({ message: "Error updating vendor status" });
  }
};
