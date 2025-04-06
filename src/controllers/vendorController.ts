import { Request, Response } from "express";
import { Vendor } from "../models/Vendor";
import { validationResult } from "express-validator";

// Get all vendors
export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find().select("-__v");
    res.json(vendors);
  } catch (error) {
    console.error("Get vendors error:", error);
    res.status(500).json({ message: "Server error" });
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
    console.error("Get vendor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create vendor
export const createVendor = async (req: Request, res: Response) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Check if vendor with same email already exists
    const existingVendor = await Vendor.findOne({
      email: req.body.email.toLowerCase(),
    });
    if (existingVendor) {
      return res.status(400).json({
        message: "Vendor with this email already exists",
        field: "email",
      });
    }

    // Create vendor profile
    const vendorData = {
      name: req.body.name,
      company: req.body.company,
      email: req.body.email.toLowerCase(),
      phoneNo: req.body.phoneNo,
      pastRelationship: req.body.pastRelationship,
      link: req.body.link,
      contactPersonPosition: req.body.contactPersonPosition,
      status: req.body.status || "Pending",
      trainerSupplied: req.body.trainerSupplied || [],
      location: req.body.location,
    };

    const vendor = await Vendor.create(vendorData);

    res.status(201).json({
      message: "Vendor created successfully",
      vendor: {
        ...vendor.toObject(),
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error in createVendor:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      message: "Server error",
      error: error.message,
      details: error.stack,
    });
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
    console.error("Update vendor error:", error);
    res.status(500).json({ message: "Server error" });
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
    console.error("Delete vendor error:", error);
    res.status(500).json({ message: "Server error" });
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
    console.error("Update vendor status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
