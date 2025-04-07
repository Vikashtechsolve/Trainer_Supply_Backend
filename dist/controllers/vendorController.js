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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVendorStatus = exports.deleteVendor = exports.updateVendor = exports.createVendor = exports.getVendor = exports.getAllVendors = void 0;
const Vendor_1 = require("../models/Vendor");
const express_validator_1 = require("express-validator");
const logger_1 = require("../utils/logger");
// Get all vendors
const getAllVendors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendors = yield Vendor_1.Vendor.find().select("-__v");
        res.json(vendors);
    }
    catch (error) {
        logger_1.logger.error("Get vendors error:", error);
        res.status(500).json({ message: "Error getting vendors" });
    }
});
exports.getAllVendors = getAllVendors;
// Get single vendor
const getVendor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendor = yield Vendor_1.Vendor.findById(req.params.id).select("-__v");
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.json(vendor);
    }
    catch (error) {
        logger_1.logger.error("Get vendor error:", error);
        res.status(500).json({ message: "Error getting vendor" });
    }
});
exports.getVendor = getVendor;
// Create vendor
const createVendor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request data
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            logger_1.logger.log("Validation errors during vendor creation");
            return res.status(400).json({ errors: errors.array() });
        }
        // Check if vendor already exists
        const existingVendor = yield Vendor_1.Vendor.findOne({
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
        const vendor = yield Vendor_1.Vendor.create(Object.assign(Object.assign({}, req.body), { email: req.body.email.toLowerCase() }));
        res.status(201).json(vendor);
    }
    catch (error) {
        logger_1.logger.error("Error in createVendor:", error);
        res.status(500).json({ message: "Error creating vendor" });
    }
});
exports.createVendor = createVendor;
// Update vendor
const updateVendor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const vendor = yield Vendor_1.Vendor.findById(req.params.id);
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
            contactPersonPosition: req.body.contactPersonPosition || vendor.contactPersonPosition,
            status: req.body.status || vendor.status,
            trainerSupplied: req.body.trainerSupplied || vendor.trainerSupplied,
            location: req.body.location || vendor.location,
        };
        const updatedVendor = yield Vendor_1.Vendor.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({
            message: "Vendor updated successfully",
            vendor: updatedVendor,
        });
    }
    catch (error) {
        logger_1.logger.error("Update vendor error:", error);
        res.status(500).json({ message: "Error updating vendor" });
    }
});
exports.updateVendor = updateVendor;
// Delete vendor
const deleteVendor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vendor = yield Vendor_1.Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        yield Vendor_1.Vendor.findByIdAndDelete(req.params.id);
        res.json({ message: "Vendor deleted successfully" });
    }
    catch (error) {
        logger_1.logger.error("Delete vendor error:", error);
        res.status(500).json({ message: "Error deleting vendor" });
    }
});
exports.deleteVendor = deleteVendor;
// Update vendor status
const updateVendorStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const vendor = yield Vendor_1.Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        vendor.status = status;
        yield vendor.save();
        res.json({
            message: "Vendor status updated successfully",
            vendor,
        });
    }
    catch (error) {
        logger_1.logger.error("Update vendor status error:", error);
        res.status(500).json({ message: "Error updating vendor status" });
    }
});
exports.updateVendorStatus = updateVendorStatus;
