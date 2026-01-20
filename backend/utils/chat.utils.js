import User from "../users/user.model.js";

export const chatAllowed = async (userA, userB) => {

  const users = await User.find({
    _id: { $in: [userA, userB] }
  }).select("role");

  const hasCreator = users.some(u => u.role === "creator");

  return hasCreator; // must be true to allow chat
};
