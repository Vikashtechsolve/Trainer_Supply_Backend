import mongoose, { Document, Schema } from 'mongoose';
import { ITrainer } from './Trainer';

export interface ICourse extends Document {
  title: string;
  description: string;
  duration: number;
  price: number;
  trainerId: ITrainer['_id'];
  schedule: {
    date: Date;
    time: string;
    duration: number;
  }[];
  materials: {
    title: string;
    url: string;
  }[];
  status: 'draft' | 'published' | 'completed';
  enrolledStudents: number;
  rating: number;
  category: string;
  prerequisites: string[];
  objectives: string[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  trainerId: {
    type: Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  schedule: [{
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  materials: [{
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'completed'],
    default: 'draft'
  },
  enrolledStudents: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  category: {
    type: String,
    required: true
  },
  prerequisites: [{
    type: String,
    required: true
  }],
  objectives: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ trainerId: 1 });
courseSchema.index({ status: 1 });

export const Course = mongoose.model<ICourse>('Course', courseSchema); 