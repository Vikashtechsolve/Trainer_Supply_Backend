import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface IVendor extends Document {
  name: string;
  company: string;
  email: string;
  phoneNo: string;
  pastRelationship: string;
  link: string;
  contactPersonPosition: string;
  status: string;
  trainerSupplied: string[];
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNo: {
      type: String,
      required: true,
      trim: true,
    },
    pastRelationship: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: false,
      trim: true,
    },
    contactPersonPosition: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    trainerSupplied: {
      type: [String],
      required: false,
      default: [],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
vendorSchema.index({ email: 1 });
vendorSchema.index({ company: 1 });
vendorSchema.index({ location: 1 });
vendorSchema.index({ status: 1 });

export const Vendor = mongoose.model<IVendor>("Vendor", vendorSchema);
