import Conversation from "./conversation.model.js";
import Message from "./message.model.js";
import { chatAllowed } from "./chat.utils.js";

/* =========================================================
   CREATE / OPEN CONVERSATION (Get in touch button)
========================================================= */
export const openConversation = async (req, res) => {
  try {
    const userA = req.user.id;
    const userB = req.params.userId;

    if (userA === userB)
      return res.status(400).json({ success: false, message: "Cannot chat with yourself" });

    const allowed = await chatAllowed(userA, userB);
    if (!allowed)
      return res.status(403).json({
        success: false,
        message: "Chat allowed only if one participant is a creator"
      });

    // check existing conversation
    let convo = await Conversation.findOne({
      participants: { $all: [userA, userB] }
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [userA, userB],
        unreadCounts: { [userB]: 0, [userA]: 0 }
      });
    }

    return res.status(200).json({ success: true, data: convo });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to open chat" });
  }
};



/* =========================================================
   SEND MESSAGE
========================================================= */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text?.trim())
      return res.status(400).json({ success: false, message: "Message cannot be empty" });

    const convo = await Conversation.findById(conversationId);
    if (!convo)
      return res.status(404).json({ success: false, message: "Conversation not found" });

    if (!convo.participants.includes(senderId))
      return res.status(403).json({ success: false, message: "You are not part of this chat" });

    const receiverId = convo.participants.find(
      id => id.toString() !== senderId
    );

    const message = await Message.create({
      conversationId,
      senderId,
      receiverId,
      text
    });

    // update last message
    convo.lastMessage = text;
    convo.lastMessageAt = new Date();

    // increment receiver unread count
    const unread = convo.unreadCounts.get(receiverId.toString()) || 0;
    convo.unreadCounts.set(receiverId.toString(), unread + 1);

    await convo.save();

    return res.status(201).json({ success: true, data: message });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
};



/* =========================================================
   GET MESSAGES IN CONVERSATION
========================================================= */
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const convo = await Conversation.findById(conversationId);
    if (!convo)
      return res.status(404).json({ success: false, message: "Conversation not found" });

    if (!convo.participants.includes(userId))
      return res.status(403).json({ success: false, message: "Access denied" });

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    // mark messages as read
    await Message.updateMany(
      { conversationId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // reset unread count
    convo.unreadCounts.set(userId, 0);
    await convo.save();

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to load messages" });
  }
};



/* =========================================================
   LIST USER CONVERSATIONS (Inbox)
========================================================= */
export const listMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name avatarUrl role");

    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to load chats" });
  }
};
