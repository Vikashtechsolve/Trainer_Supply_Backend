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
exports.updateTrainerStatus = exports.updateDocuments = exports.updateAvailability = exports.deleteTrainer = exports.updateInterviewStatus = exports.updateTrainer = exports.createTrainer = exports.getTrainer = exports.getAllTrainers = void 0;
const Trainer_1 = require("../models/Trainer");
const User_1 = require("../models/User");
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = require("../utils/logger");
// Configure multer for file upload
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
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
// Get all trainers
const getAllTrainers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trainers = yield Trainer_1.Trainer.find()
            .populate("userId", "firstName lastName email")
            .select("-__v");
        res.json(trainers);
    }
    catch (error) {
        logger_1.logger.error("Get trainers error:", error);
        res.status(500).json({ message: "Error getting trainers" });
    }
});
exports.getAllTrainers = getAllTrainers;
// Get single trainer
const getTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trainer = yield Trainer_1.Trainer.findById(req.params.id)
            .populate("userId", "firstName lastName email")
            .select("-__v");
        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        res.json(trainer);
    }
    catch (error) {
        logger_1.logger.error("Get trainer error:", error);
        res.status(500).json({ message: "Error getting trainer" });
    }
});
exports.getTrainer = getTrainer;
// Create trainer
const createTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request data
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            logger_1.logger.log("Validation errors during trainer creation");
            return res.status(400).json({ errors: errors.array() });
        }
        // Extract trainer data from request body
        const { name, email, phoneNo, qualification, passingYear, expertise, teachingExperience, developmentExperience, totalExperience, feasibleTime, payoutExpectation, location, remarks, } = req.body;
        // Check if user already exists
        const existingUser = yield User_1.User.findOne({
            email: email.toLowerCase(),
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists",
                field: "email",
            });
        }
        // Check if trainer already exists
        const existingTrainer = yield Trainer_1.Trainer.findOne({
            email: email.toLowerCase(),
        });
        if (existingTrainer) {
            return res.status(400).json({
                message: "Trainer with this email already exists",
                field: "email",
            });
        }
        // Split name into firstName and lastName
        const nameParts = name.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || firstName;
        // Create user account with default password
        const defaultPassword = "Trainer@123";
        const hashedPassword = yield bcrypt_1.default.hash(defaultPassword, 10);
        const user = yield User_1.User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "trainer",
        });
        // Handle file upload
        let resumePath = "";
        if (req.file) {
            resumePath = req.file.filename;
        }
        // Parse and validate numeric fields
        const passingYearParsed = Math.max(1900, Math.min(new Date().getFullYear(), parseInt(passingYear) || 0));
        const teachingExperienceParsed = Math.max(0, parseInt(teachingExperience) || 0);
        const developmentExperienceParsed = Math.max(0, parseInt(developmentExperience) || 0);
        const totalExperienceParsed = Math.max(0, parseInt(totalExperience) || 0);
        const payoutExpectationParsed = Math.max(0, parseInt(payoutExpectation) || 0);
        // Create trainer profile
        const trainerData = {
            userId: user._id,
            name,
            email: email.toLowerCase(),
            phoneNo,
            qualification,
            passingYear: passingYearParsed,
            expertise,
            teachingExperience: teachingExperienceParsed,
            developmentExperience: developmentExperienceParsed,
            totalExperience: totalExperienceParsed,
            feasibleTime,
            payoutExpectation: payoutExpectationParsed,
            location,
            remarks,
            resume: resumePath,
            status: "active",
            interview: req.body.interview || "Not taken",
        };
        const trainer = yield Trainer_1.Trainer.create(trainerData);
        res.status(201).json({
            message: "Trainer created successfully",
            trainer: Object.assign(Object.assign({}, trainer.toObject()), { createdAt: trainer.createdAt, updatedAt: trainer.updatedAt }),
        });
    }
    catch (error) {
        logger_1.logger.error("Error in createTrainer:", error);
        logger_1.logger.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        // If there's an error and a file was uploaded, delete it
        if (req.file) {
            const filePath = path_1.default.join(__dirname, "../uploads", req.file.filename);
            fs_1.default.unlink(filePath, (err) => {
                if (err)
                    logger_1.logger.error("Error deleting file:", err);
            });
        }
        res.status(500).json({
            message: "Error creating trainer",
            error: error.message,
            details: error.stack,
        });
    }
});
exports.createTrainer = createTrainer;
// Update trainer
const updateTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { skills, experience, bio, hourlyRate, availability, status } = req.body;
        const trainer = yield Trainer_1.Trainer.findById(req.params.id);
        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        // Update fields
        if (skills)
            trainer.skills = skills;
        if (bio)
            trainer.bio = bio;
        if (hourlyRate)
            trainer.hourlyRate = hourlyRate;
        if (availability)
            trainer.availability = availability;
        if (status)
            trainer.status = status;
        yield trainer.save();
        res.json({
            message: "Trainer updated successfully",
            trainer,
        });
    }
    catch (error) {
        logger_1.logger.error("Update trainer error:", error);
        res.status(500).json({ message: "Error updating trainer" });
    }
});
exports.updateTrainer = updateTrainer;
//update interview status
const updateInterviewStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { interview } = req.body;
        const trainer = yield Trainer_1.Trainer.findById(req.params.id);
        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        trainer.interview = interview;
        yield trainer.save();
        res.json({
            message: "Interview status updated successfully",
            interview: trainer.interview,
        });
    }
    catch (error) {
        logger_1.logger.error("Update interview status error:", error);
        res.status(500).json({ message: "Error updating interview status" });
    }
});
exports.updateInterviewStatus = updateInterviewStatus;
// Delete trainer
const deleteTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trainer = yield Trainer_1.Trainer.findById(req.params.id);
        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        yield trainer.deleteOne();
        res.json({ message: "Trainer deleted successfully" });
    }
    catch (error) {
        logger_1.logger.error("Delete trainer error:", error);
        res.status(500).json({ message: "Error deleting trainer" });
    }
});
exports.deleteTrainer = deleteTrainer;
// Update trainer availability
const updateAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { availability } = req.body;
        const trainer = yield Trainer_1.Trainer.findById(req.params.id);
        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        trainer.availability = availability;
        yield trainer.save();
        res.json({
            message: "Availability updated successfully",
            availability: trainer.availability,
        });
    }
    catch (error) {
        logger_1.logger.error("Update availability error:", error);
        res.status(500).json({ message: "Error updating availability" });
    }
});
exports.updateAvailability = updateAvailability;
// Update trainer documents
const updateDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documents } = req.body;
        const trainer = yield Trainer_1.Trainer.findById(req.params.id);
        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        trainer.documents = documents;
        yield trainer.save();
        res.json({
            message: "Documents updated successfully",
            documents: trainer.documents,
        });
    }
    catch (error) {
        logger_1.logger.error("Update documents error:", error);
        res.status(500).json({ message: "Error updating documents" });
    }
});
exports.updateDocuments = updateDocuments;
// Update trainer status
const updateTrainerStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const trainer = yield Trainer_1.Trainer.findById(req.params.id);
        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        trainer.status = status;
        yield trainer.save();
        res.json({
            message: "Trainer status updated successfully",
            trainer: {
                id: trainer._id,
                status: trainer.status,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Update trainer status error:", error);
        res.status(500).json({ message: "Error updating trainer status" });
    }
});
exports.updateTrainerStatus = updateTrainerStatus;
