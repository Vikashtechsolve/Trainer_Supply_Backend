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
exports.updateSchedule = exports.updateMaterials = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourse = exports.getAllCourses = void 0;
const Course_1 = require("../models/Course");
const Trainer_1 = require("../models/Trainer");
const express_validator_1 = require("express-validator");
const logger_1 = require("../utils/logger");
// Get all courses
const getAllCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield Course_1.Course.find()
            .populate("trainerId", "userId skills experience")
            .populate("trainerId.userId", "firstName lastName email")
            .select("-__v");
        res.json(courses);
    }
    catch (error) {
        logger_1.logger.error("Get courses error:", error);
        res.status(500).json({ message: "Error getting courses" });
    }
});
exports.getAllCourses = getAllCourses;
// Get single course
const getCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield Course_1.Course.findById(req.params.id)
            .populate("trainerId", "userId skills experience")
            .populate("trainerId.userId", "firstName lastName email")
            .select("-__v");
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.json(course);
    }
    catch (error) {
        logger_1.logger.error("Get course error:", error);
        res.status(500).json({ message: "Error getting course" });
    }
});
exports.getCourse = getCourse;
// Create course
const createCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, duration, price, trainerId, schedule, materials, category, prerequisites, objectives, } = req.body;
        // Check if trainer exists
        const trainer = yield Trainer_1.Trainer.findById(trainerId);
        if (!trainer) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        const course = new Course_1.Course({
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
        yield course.save();
        res.status(201).json(course);
    }
    catch (error) {
        logger_1.logger.error("Create course error:", error);
        res.status(500).json({ message: "Error creating course" });
    }
});
exports.createCourse = createCourse;
// Update course
const updateCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, duration, price, schedule, materials, status, category, prerequisites, objectives, } = req.body;
        const course = yield Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        // Update fields
        if (title)
            course.title = title;
        if (description)
            course.description = description;
        if (duration)
            course.duration = duration;
        if (price)
            course.price = price;
        if (schedule)
            course.schedule = schedule;
        if (materials)
            course.materials = materials;
        if (status)
            course.status = status;
        if (category)
            course.category = category;
        if (prerequisites)
            course.prerequisites = prerequisites;
        if (objectives)
            course.objectives = objectives;
        yield course.save();
        res.json({
            message: "Course updated successfully",
            course,
        });
    }
    catch (error) {
        logger_1.logger.error("Update course error:", error);
        res.status(500).json({ message: "Error updating course" });
    }
});
exports.updateCourse = updateCourse;
// Delete course
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        yield course.deleteOne();
        res.json({ message: "Course deleted successfully" });
    }
    catch (error) {
        logger_1.logger.error("Delete course error:", error);
        res.status(500).json({ message: "Error deleting course" });
    }
});
exports.deleteCourse = deleteCourse;
// Update course materials
const updateMaterials = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { materials } = req.body;
        const course = yield Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        course.materials = materials;
        yield course.save();
        res.json({
            message: "Materials updated successfully",
            materials: course.materials,
        });
    }
    catch (error) {
        logger_1.logger.error("Update materials error:", error);
        res.status(500).json({ message: "Error updating materials" });
    }
});
exports.updateMaterials = updateMaterials;
// Update course schedule
const updateSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { schedule } = req.body;
        const course = yield Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        course.schedule = schedule;
        yield course.save();
        res.json({
            message: "Schedule updated successfully",
            schedule: course.schedule,
        });
    }
    catch (error) {
        logger_1.logger.error("Update schedule error:", error);
        res.status(500).json({ message: "Error updating schedule" });
    }
});
exports.updateSchedule = updateSchedule;
