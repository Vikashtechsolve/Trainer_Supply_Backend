import { Request, Response } from "express";
import { Trainer } from "../models/Trainer";
import { User } from "../models/User";
import { validationResult } from "express-validator";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";

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
    console.error("Get trainers error:", error);
    res.status(500).json({ message: "Server error" });
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
    console.error("Get trainer error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create trainer
export const createTrainer = async (req: Request, res: Response) => {
  try {
    console.log("Received request body:", req.body);
    console.log("Received file:", req.file);

    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: req.body.email.toLowerCase(),
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
        field: "email",
      });
    }

    // Check if trainer already exists
    const existingTrainer = await Trainer.findOne({
      email: req.body.email.toLowerCase(),
    });
    if (existingTrainer) {
      return res.status(400).json({
        message: "Trainer with this email already exists",
        field: "email",
      });
    }

    // Split name into firstName and lastName
    const nameParts = req.body.name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName;

    // Create user account with default password
    const defaultPassword = "Trainer@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
      role: "trainer",
    });

    console.log("Created user:", user);

    // Handle file upload
    let resumePath = "";
    if (req.file) {
      resumePath = req.file.filename;
      console.log("Resume path:", resumePath);
    }

    // Parse and validate numeric fields
    const passingYear = Math.max(
      1900,
      Math.min(new Date().getFullYear(), parseInt(req.body.passingYear) || 0)
    );
    const teachingExperience = Math.max(
      0,
      parseInt(req.body.teachingExperience) || 0
    );
    const developmentExperience = Math.max(
      0,
      parseInt(req.body.developmentExperience) || 0
    );
    const totalExperience = Math.max(
      0,
      parseInt(req.body.totalExperience) || 0
    );
    const payoutExpectation = Math.max(
      0,
      parseInt(req.body.payoutExpectation) || 0
    );

    // Create trainer profile
    const trainerData = {
      userId: user._id,
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      phoneNo: req.body.phoneNo,
      qualification: req.body.qualification,
      passingYear,
      expertise: req.body.expertise,
      teachingExperience,
      developmentExperience,
      totalExperience,
      feasibleTime: req.body.feasibleTime,
      payoutExpectation,
      location: req.body.location,
      remarks: req.body.remarks,
      resume: resumePath,
      status: "active",
    };

    console.log("Creating trainer with data:", trainerData);

    const trainer = await Trainer.create(trainerData);
    console.log("Created trainer:", trainer);

    res.status(201).json({
      message: "Trainer created successfully",
      trainer: {
        ...trainer.toObject(),
        createdAt: trainer.createdAt,
        updatedAt: trainer.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error in createTrainer:", error);
    console.error("Error stack:", error.stack);

    // If there's an error and a file was uploaded, delete it
    if (req.file) {
      const filePath = path.join(__dirname, "../uploads", req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    res.status(500).json({
      message: "Server error",
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
    console.error("Update trainer error:", error);
    res.status(500).json({ message: "Server error" });
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
    console.error("Delete trainer error:", error);
    res.status(500).json({ message: "Server error" });
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
    console.error("Update availability error:", error);
    res.status(500).json({ message: "Server error" });
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
    console.error("Update documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
