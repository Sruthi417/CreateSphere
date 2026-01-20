import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    sender: { type: String, enum: ["user", "ai"], required: true },

    input: {
      type: {
        type: String,
        enum: ["text", "image", "audio"],
        default: null
      },
      text: { type: String, default: null },
      imageUrl: { type: String, default: null },
      audioUrl: { type: String, default: null }
    },

    output: {
      narration: { type: String, default: null },
      ideas: { type: Array, default: [] },
      youtubeLinks: { type: Array, default: [] },

      // image output
    generatedImageUrl: { type: String, default: null }, // URL stored in DB

      ideaId: { type: String, default: null }
    }
  },
  { timestamps: true }
);

const ChatbotSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },

    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },

    // ✅ Persist materials + ideas for follow-up context
    materials: { type: [String], default: [] },
    lastIdeas: { type: Array, default: [] },

    // ✅ simple admin title
    title: { type: String, default: "" },

    messages: { type: [MessageSchema], default: [] },

    status: {
      type: String,
      enum: ["active", "expired", "ended"],
      default: "active",
      index: true
    },

    lastActivityAt: { type: Date, default: Date.now, index: true },

    // inactivity expiry (NOT TTL delete)
    expiresAt: { type: Date, required: true, index: true },

    endedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("ChatbotSession", ChatbotSessionSchema);
