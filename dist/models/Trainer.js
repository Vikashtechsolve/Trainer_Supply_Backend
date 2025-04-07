"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trainer = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const trainerSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    phoneNo: {
        type: String,
        required: true,
        trim: true,
    },
    qualification: {
        type: String,
        required: true,
        trim: true,
    },
    passingYear: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
        min: 1900,
        max: new Date().getFullYear(),
    },
    expertise: {
        type: String,
        required: true,
        trim: true,
    },
    teachingExperience: {
        type: Number,
        required: true,
        min: 0,
    },
    developmentExperience: {
        type: Number,
        required: true,
        min: 0,
    },
    totalExperience: {
        type: Number,
        required: true,
        min: 0,
    },
    feasibleTime: {
        type: String,
        required: true,
        trim: true,
    },
    payoutExpectation: {
        type: Number,
        required: true,
        min: 0,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    remarks: {
        type: String,
        required: false,
        trim: true,
        maxlength: 500,
    },
    resume: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Selected", "Rejected", "Pending"],
        default: "Pending",
    },
    documents: {
        type: [String], // Array of document URLs
        required: false,
    },
    skills: {
        type: [String],
        required: false,
    },
    bio: {
        type: String,
        required: false,
        trim: true,
        maxlength: 1000,
    },
    hourlyRate: {
        type: Number,
        required: false,
        min: 0,
    },
    availability: {
        type: [{ day: String, slots: [String] }],
        required: false,
        trim: true,
    },
    interview: {
        type: String,
        enum: ["Taken", "Not taken"],
        default: "Not taken",
    },
}, {
    timestamps: true,
});
// Indexes for better query performance
trainerSchema.index({ email: 1 });
trainerSchema.index({ location: 1 });
trainerSchema.index({ expertise: 1 });
trainerSchema.index({ status: 1 });
exports.Trainer = mongoose_1.default.model("Trainer", trainerSchema);
