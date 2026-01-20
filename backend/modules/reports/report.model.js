import mongoose from "mongoose";

const { Schema } = mongoose;

const ReportSchema = new Schema(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // Who is being reported (creator of content)
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    targetType: {
      type: String,
      enum: ["product", "tutorial", "creator", "user"],
      required: true,
      index: true
    },

    reasonCode: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "misleading",
        "copyright",
        "inappropriate",
        "scam"
      ],
      required: true
    },

    additionalNote: {
      type: String,
      trim: true,
      default: ""
    },

    handled: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Report", ReportSchema);
