import mongoose from "mongoose";

const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["product", "tutorial", "both"],
      default: "both",
      index: true,
    },

    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,   // soft delete support
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CategorySchema.index({ name: 1 });

export default mongoose.model("Category", CategorySchema);
