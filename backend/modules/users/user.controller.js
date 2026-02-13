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

    // Check if already following - if yes, return success without making changes
    const isAlreadyFollowing = user.following.some(id => id.toString() === creatorId.toString());
    
    if (isAlreadyFollowing) {
      // Already following, return success but don't increment again
      return res.status(200).json({
        success: true,
        message: "Already following this creator",
        data: { isFollowing: true, followersCount: creator.creatorProfile.followersCount }
      });
    }

    // Not following yet - add to follow relationship
    user.following.push(creatorId);
    creator.creatorProfile.followers.push(userId);

    // Recalculate followersCount from array length
    creator.creatorProfile.followersCount = creator.creatorProfile.followers.length;

    await user.save();
    await creator.save();

    return res.status(200).json({
      success: true,
      message: "Creator followed",
      data: { isFollowing: true, followersCount: creator.creatorProfile.followersCount }
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

    // Check if not following - if true, return success without making changes
    const isFollowing = user.following.some(id => id.toString() === creatorId.toString());
    
    if (!isFollowing) {
      // Not following, return success but don't decrement
      return res.status(200).json({
        success: true,
        message: "Not following this creator",
        data: { isFollowing: false, followersCount: creator.creatorProfile.followersCount }
      });
    }

    // Currently following - remove the follow relationship
    user.following = user.following.filter(
      id => id.toString() !== creatorId.toString()
    );

    creator.creatorProfile.followers =
      creator.creatorProfile.followers.filter(
        id => id.toString() !== userId.toString()
      );

    // Recalculate followersCount from array length
    creator.creatorProfile.followersCount =
      creator.creatorProfile.followers.length;

    await user.save();
    await creator.save();

    return res.status(200).json({
      success: true,
      message: "Creator unfollowed",
      data: { isFollowing: false, followersCount: creator.creatorProfile.followersCount }
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
   UPLOAD PROFILE AVATAR
========================================================= */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: "Only image files are allowed (JPEG, PNG, WebP, GIF)" });
    }

    const maxFileSize = 2 * 1024 * 1024; // 2MB
    if (req.file.size > maxFileSize) {
      return res.status(400).json({ success: false, message: "File size must be less than 2MB" });
    }

    // Generate URL based on storage method
    // For local storage: /uploads/{filename}
    // For Cloudinary: would be set by middleware
    let avatarUrl = req.file.secure_url || `/uploads/${req.file.filename}`;

    // Update user with new avatar URL
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatarUrl } },
      { new: true }
    ).select("name email avatarUrl role");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatarUrl: user.avatarUrl,
        user: user
      }
    });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: "Failed to upload avatar" });
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
