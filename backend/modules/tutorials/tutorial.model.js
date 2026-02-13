import mongoose from "mongoose";
const { Schema } = mongoose;

const TopicSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, default: "" }, // Placeholder for future
    duration: { type: Number, default: 0 },
  },
  { _id: true }
);

const LessonSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    topics: [TopicSchema],
  },
  { _id: true }
);

const TutorialSchema = new Schema(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    thumbnailUrl: { type: String, default: "" },
    tags: [{ type: String, trim: true }],

    lessons: [LessonSchema],

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },

    type: {
      type: String,
      enum: ["free", "course"],
      default: "course",
    },

    averageRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },

    savedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],

    status: {
      type: String,
      enum: ["active", "hidden", "removed"],
      default: "active",
      index: true,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    moderation: {
      reason: { type: String, default: null },
      strikeCount: { type: Number, default: 0 },
      hiddenUntil: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tutorial", TutorialSchema);
