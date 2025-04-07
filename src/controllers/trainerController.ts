import { Request, Response } from "express";
import { Trainer } from "../models/Trainer";
import { User } from "../models/User";
import { validationResult } from "express-validator";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { logger } from "../utils/logger";

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
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

// Get all trainers
export const getAllTrainers = async (req: Request, res: Response) => {
  try {
    const trainers = await Trainer.find()
      .populate("userId", "firstName lastName email")
      .select("-__v");

    res.json(trainers);
  } catch (error) {
    logger.error("Get trainers error:", error);
    res.status(500).json({ message: "Error getting trainers" });
  }
};

// Get single trainer
export const getTrainer = async (req: Request, res: Response) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate("userId", "firstName lastName email")
      .select("-__v");

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.json(trainer);
  } catch (error) {
    logger.error("Get trainer error:", error);
    res.status(500).json({ message: "Error getting trainer" });
  }
};

// Create trainer
export const createTrainer = async (req: Request, res: Response) => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.log("Validation errors during trainer creation");
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract trainer data from request body
    const {
      name,
      email,
      phoneNo,
      qualification,
      passingYear,
      expertise,
      teachingExperience,
      developmentExperience,
      totalExperience,
      feasibleTime,
      payoutExpectation,
      location,
      remarks,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
        field: "email",
      });
    }

    // Check if trainer already exists
    const existingTrainer = await Trainer.findOne({
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
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await User.create({
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
    const passingYearParsed = Math.max(
      1900,
      Math.min(new Date().getFullYear(), parseInt(passingYear) || 0)
    );
    const teachingExperienceParsed = Math.max(
      0,
      parseInt(teachingExperience) || 0
    );
    const developmentExperienceParsed = Math.max(
      0,
      parseInt(developmentExperience) || 0
    );
    const totalExperienceParsed = Math.max(0, parseInt(totalExperience) || 0);
    const payoutExpectationParsed = Math.max(
      0,
      parseInt(payoutExpectation) || 0
    );

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

    const trainer = await Trainer.create(trainerData);

    res.status(201).json({
      message: "Trainer created successfully",
      trainer: {
        ...trainer.toObject(),
        createdAt: trainer.createdAt,
        updatedAt: trainer.updatedAt,
      },
    });
  } catch (error: any) {
    logger.error("Error in createTrainer:", error);
    logger.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // If there's an error and a file was uploaded, delete it
    if (req.file) {
      const filePath = path.join(__dirname, "../uploads", req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) logger.error("Error deleting file:", err);
      });
    }

    res.status(500).json({
      message: "Error creating trainer",
      error: error.message,
      details: error.stack,
    });
  }
};

// Update trainer
export const updateTrainer = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { skills, experience, bio, hourlyRate, availability, status } =
      req.body;

    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Update fields
    if (skills) trainer.skills = skills;
    if (bio) trainer.bio = bio;
    if (hourlyRate) trainer.hourlyRate = hourlyRate;
    if (availability) trainer.availability = availability;
    if (status) trainer.status = status;

    await trainer.save();

    res.json({
      message: "Trainer updated successfully",
      trainer,
    });
  } catch (error) {
    logger.error("Update trainer error:", error);
    res.status(500).json({ message: "Error updating trainer" });
  }
};

//update interview status
export const updateInterviewStatus = async (req: Request, res: Response) => {
  try {
    const { interview } = req.body;
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    trainer.interview = interview;
    await trainer.save();

    res.json({
      message: "Interview status updated successfully",
      interview: trainer.interview,
    });
  } catch (error) {
    logger.error("Update interview status error:", error);
    res.status(500).json({ message: "Error updating interview status" });
  }
};

// Delete trainer
export const deleteTrainer = async (req: Request, res: Response) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    await trainer.deleteOne();

    res.json({ message: "Trainer deleted successfully" });
  } catch (error) {
    logger.error("Delete trainer error:", error);
    res.status(500).json({ message: "Error deleting trainer" });
  }
};

// Update trainer availability
export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const { availability } = req.body;
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    trainer.availability = availability;
    await trainer.save();

    res.json({
      message: "Availability updated successfully",
      availability: trainer.availability,
    });
  } catch (error) {
    logger.error("Update availability error:", error);
    res.status(500).json({ message: "Error updating availability" });
  }
};

// Update trainer documents
export const updateDocuments = async (req: Request, res: Response) => {
  try {
    const { documents } = req.body;
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    trainer.documents = documents;
    await trainer.save();

    res.json({
      message: "Documents updated successfully",
      documents: trainer.documents,
    });
  } catch (error) {
    logger.error("Update documents error:", error);
    res.status(500).json({ message: "Error updating documents" });
  }
};

// Update trainer status
export const updateTrainerStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    trainer.status = status;
    await trainer.save();

    res.json({
      message: "Trainer status updated successfully",
      trainer: {
        id: trainer._id,
        status: trainer.status,
      },
    });
  } catch (error) {
    logger.error("Update trainer status error:", error);
    res.status(500).json({ message: "Error updating trainer status" });
  }
};
