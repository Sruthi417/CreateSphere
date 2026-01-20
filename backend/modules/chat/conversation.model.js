import mongoose from "mongoose";
const { Schema } = mongoose;

const ConversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      }
    ],

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    unreadCounts: {
      // key = userId, value = number of unread messages
      type: Map,
      of: Number,
      default: {}
    }

  },
  { timestamps: true }
);

export default mongoose.model("Conversation", ConversationSchema);
