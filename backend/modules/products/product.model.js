import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    images: [
      {
        type: String,
        required: true,
      }
    ],

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    // Optional - price is negotiated via chat
    estimatedPrice: {
      type: Number,
      default: null,
    },

    isCustomizable: {
      type: Boolean,
      default: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 180
    },

    metadata: {
      materialsUsed: [{ type: String }],
      estimatedCreationTime: { type: String },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
      },
    },

    averageRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "hidden", "removed"],
      default: "active",
      index: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    chatEnabled: {
      type: Boolean,
      default: true,
    },

    reportsCount: {
      type: Number,
      default: 0,
    },

    moderation: {
      reason: { type: String, default: null },
      strikeCount: { type: Number, default: 0 },
      hiddenUntil: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);
