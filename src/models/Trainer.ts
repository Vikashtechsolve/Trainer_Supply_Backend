import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface ITrainer extends Document {
  userId: IUser["_id"];
  name: string;
  email: string;
  phoneNo: string;
  qualification: string;
  passingYear: number;
  expertise: string;
  teachingExperience: number;
  developmentExperience: number;
  totalExperience: number;
  feasibleTime: string;
  payoutExpectation: number;
  location: string;
  remarks?: string;
  resume: File | string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
  skills?: string[];
  bio?: string;
  hourlyRate?: number;
  availability?: string;
  documents?: File;
}

const trainerSchema = new Schema<ITrainer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
      type: Number,
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
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
trainerSchema.index({ email: 1 });
trainerSchema.index({ location: 1 });
trainerSchema.index({ expertise: 1 });
trainerSchema.index({ status: 1 });

export const Trainer = mongoose.model<ITrainer>("Trainer", trainerSchema);
