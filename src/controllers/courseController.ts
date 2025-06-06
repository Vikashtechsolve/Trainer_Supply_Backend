import { Request, Response } from "express";
import { Course } from "../models/Course";
import { Trainer } from "../models/Trainer";
import { validationResult } from "express-validator";
import { logger } from "../utils/logger";

// Get all courses
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find()
      .populate("trainerId", "userId skills experience")
      .populate("trainerId.userId", "firstName lastName email")
      .select("-__v");

    res.json(courses);
  } catch (error) {
    logger.error("Get courses error:", error);
    res.status(500).json({ message: "Error getting courses" });
  }
};

// Get single course
export const getCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("trainerId", "userId skills experience")
      .populate("trainerId.userId", "firstName lastName email")
      .select("-__v");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    logger.error("Get course error:", error);
    res.status(500).json({ message: "Error getting course" });
  }
};

// Create course
export const createCourse = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      duration,
      price,
      trainerId,
      schedule,
      materials,
      category,
      prerequisites,
      objectives,
    } = req.body;

    // Check if trainer exists
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const course = new Course({
      title,
      description,
      duration,
      price,
      trainerId,
      schedule,
      materials,
      category,
      prerequisites,
      objectives,
    });

    await course.save();

    res.status(201).json(course);
  } catch (error) {
    logger.error("Create course error:", error);
    res.status(500).json({ message: "Error creating course" });
  }
};

// Update course
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      duration,
      price,
      schedule,
      materials,
      status,
      category,
      prerequisites,
      objectives,
    } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (duration) course.duration = duration;
    if (price) course.price = price;
    if (schedule) course.schedule = schedule;
    if (materials) course.materials = materials;
    if (status) course.status = status;
    if (category) course.category = category;
    if (prerequisites) course.prerequisites = prerequisites;
    if (objectives) course.objectives = objectives;

    await course.save();

    res.json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    logger.error("Update course error:", error);
    res.status(500).json({ message: "Error updating course" });
  }
};

// Delete course
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.deleteOne();

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    logger.error("Delete course error:", error);
    res.status(500).json({ message: "Error deleting course" });
  }
};

// Update course materials
export const updateMaterials = async (req: Request, res: Response) => {
  try {
    const { materials } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.materials = materials;
    await course.save();

    res.json({
      message: "Materials updated successfully",
      materials: course.materials,
    });
  } catch (error) {
    logger.error("Update materials error:", error);
    res.status(500).json({ message: "Error updating materials" });
  }
};

// Update course schedule
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { schedule } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.schedule = schedule;
    await course.save();

    res.json({
      message: "Schedule updated successfully",
      schedule: course.schedule,
    });
  } catch (error) {
    logger.error("Update schedule error:", error);
    res.status(500).json({ message: "Error updating schedule" });
  }
};
