import mongoose from "mongoose";
import User from "./user.model.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);



/* =========================================================
   GET MY ACCOUNT DETAILS
========================================================= */
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email role avatarUrl onboardingStatus creatorProfile isBlocked"
    );

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, data: user });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};



/* =========================================================
   UPDATE MY PROFILE (whitelist fields only)
========================================================= */
export const updateMyProfile = async (req, res) => {
  try {
    const updates = {};

    if (req.body.name) updates.name = req.body.name.trim();
    if (req.body.avatarUrl) updates.avatarUrl = req.body.avatarUrl;

    // prevent mass-assignment
    // user cannot edit role, creatorProfile, admin flags

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("name email avatarUrl role creatorProfile");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: user,
    });

  } catch {
    return res.status(500).json({ success: false, message: "Profile update failed" });
  }
};



/* =========================================================
   FOLLOW CREATOR
========================================================= */
export const followCreator = async (req, res) => {
  try {
    const userId = req.user.id;
    const creatorId = req.params.creatorId;

    if (!isValidId(creatorId))
      return res.status(400).json({ success: false, message: "Invalid creator id" });

    if (userId.toString() === creatorId.toString())
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });

    const user = await User.findById(userId);
    const creator = await User.findById(creatorId);

    if (!user || !creator || creator.role !== "creator")
      return res.status(404).json({ success: false, message: "Creator not found" });

    // already following
    if (user.following.includes(creatorId))
      return res.status(200).json({ success: true, message: "Already following" });

    user.following.push(creatorId);

    creator.creatorProfile.followers.push(userId);
    creator.creatorProfile.followersCount =
      creator.creatorProfile.followers.length;

    await user.save();
    await creator.save();

    return res.status(200).json({
      success: true,
      message: "Creator followed",
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to follow creator" });
  }
};



/* =========================================================
   UNFOLLOW CREATOR
========================================================= */
export const unfollowCreator = async (req, res) => {
  try {
    const userId = req.user.id;
    const creatorId = req.params.creatorId;

    if (!isValidId(creatorId))
      return res.status(400).json({ success: false, message: "Invalid creator id" });

    const user = await User.findById(userId);
    const creator = await User.findById(creatorId);

    if (!user || !creator || creator.role !== "creator")
      return res.status(404).json({ success: false, message: "Creator not found" });

    user.following = user.following.filter(
      id => id.toString() !== creatorId
    );

    creator.creatorProfile.followers =
      creator.creatorProfile.followers.filter(
        id => id.toString() !== userId
      );

    creator.creatorProfile.followersCount =
      creator.creatorProfile.followers.length;

    await user.save();
    await creator.save();

    return res.status(200).json({
      success: true,
      message: "Creator unfollowed",
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to unfollow creator" });
  }
};



/* =========================================================
   GET MY FOLLOWING LIST
========================================================= */
export const getMyFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("following",
        "creatorProfile.displayName creatorProfile.tagline avatarUrl"
      );

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      data: user.following,
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch following list" });
  }
};



/* =========================================================
   ADD PRODUCT TO FAVORITES
========================================================= */
export const addFavoriteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.favoriteProducts.includes(productId))
      return res.status(200).json({ success: true, message: "Already in favorites" });

    user.favoriteProducts.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to favorites",
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to add favorite" });
  }
};



/* =========================================================
   REMOVE FROM FAVORITES
========================================================= */
export const removeFavoriteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.favoriteProducts =
      user.favoriteProducts.filter(id => id.toString() !== productId);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from favorites",
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to remove favorite" });
  }
};



/* =========================================================
   GET MY FAVORITE PRODUCTS
========================================================= */
export const getMyFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("favoriteProducts", "title images price status");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      data: user.favoriteProducts,
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch favorites" });
  }
};
