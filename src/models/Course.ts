import mongoose, { Schema, Document } from "mongoose";

export interface ICourseVideo {
  id: string;
  title: string;
  url: string;
  addedAt: string;
}

export interface ICourse extends Document {
  id: string;
  title: string;
  trainer: string;
  modules: number;
  hours: string;
  progress: number;
  hue: number;
  price?: number;
  videos: ICourseVideo[];
}

const CourseVideoSchema = new Schema<ICourseVideo>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  addedAt: { type: String, required: true },
});

const CourseSchema = new Schema<ICourse>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    trainer: { type: String, required: true },
    modules: { type: Number, required: true },
    hours: { type: String, required: true },
    progress: { type: Number, required: true },
    hue: { type: Number, required: true },
    price: { type: Number, required: false },
    videos: { type: [CourseVideoSchema], default: [] },
  },
  { timestamps: true }
);

export const Course = mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
