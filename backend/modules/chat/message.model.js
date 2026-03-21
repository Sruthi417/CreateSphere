import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    text: {
      type: String,
      trim: true,
      required: function() { return !this.attachmentUrl; }
    },

    attachmentUrl: {
      type: String,
      default: ""
    },

    isRead: {
      type: Boolean,
      default: false
    }

  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
