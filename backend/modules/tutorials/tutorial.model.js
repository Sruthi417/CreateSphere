import mongoose from "mongoose";
const { Schema } = mongoose;

const LessonSchema = new Schema(
  {
    lessonNumber: Number,
    title: String,
    videoUrl: String,
    duration: Number,
  },
  { _id: false }
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

    thumbnailUrl: String,

    lessons: [LessonSchema],

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      index: true,
    },

    isPlaylist: { type: Boolean, default: false },

    type: {
      type: String,
      enum: ["free", "course"],
      default: "free",
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
