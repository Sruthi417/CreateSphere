import mongoose from "mongoose";
const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    targetType: {
      type: String,
      enum: ["product", "tutorial"],
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,     // rating is optional
    },

    comment: {
      type: String,
      trim: true,
      default: "",       // comment optional
    },

  },
  { timestamps: true }
);

export default mongoose.model("Review", ReviewSchema);
