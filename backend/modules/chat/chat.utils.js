import User from "../users/user.model.js";

/**
 * Check if chat is allowed between two users
 * Rule: At least one participant must be a creator
 * @param {string} userAId - First user ID
 * @param {string} userBId - Second user ID
 * @returns {Promise<boolean>} - True if chat is allowed
 */
export const chatAllowed = async (userAId, userBId) => {
    try {
        const [userA, userB] = await Promise.all([
            User.findById(userAId).select("role"),
            User.findById(userBId).select("role")
        ]);

        if (!userA || !userB) {
            return false;
        }

        // At least one must be a creator
        return userA.role === "creator" || userB.role === "creator";
    } catch (error) {
        console.error("Error checking chat permission:", error);
        return false;
    }
};
