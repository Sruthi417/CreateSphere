import User from "../users/user.model.js";

/* =========================================================
   START CREATOR ONBOARDING (user → creator_pending)
========================================================= */
export const startOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.role === "creator")
      return res.status(400).json({ success: false, message: "You are already a creator" });

    if (user.onboardingStatus === "creator_pending")
      return res.status(200).json({ success: true, message: "Creator onboarding already started" });

    user.onboardingStatus = "creator_pending";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Creator onboarding started",
    });

  } catch {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};




/* =========================================================
   COMPLETE CREATOR SETUP (upgrade → creator)
========================================================= */
export const completeCreatorSetup = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.role === "creator")
      return res.status(400).json({ success: false, message: "Creator profile already completed" });

    if (user.onboardingStatus !== "creator_pending")
      return res.status(400).json({ success: false, message: "Start onboarding first" });

    const {
      displayName,
      tagline,
      fullBio,
      portfolio = [],
      categories = []
    } = req.body;

    if (!displayName || !fullBio)
      return res.status(400).json({
        success: false,
        message: "Display name and bio are required"
      });

    user.creatorProfile = {
      displayName,
      tagline,
      fullBio,
      portfolio,
      categories,

      products: [],
      tutorials: [],

      rating: 0,
      followers: [],
      followersCount: 0,

      verified: false,
      isDeactivated: false,
    };

    user.role = "creator";
    user.onboardingStatus = "creator_completed";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Creator profile setup completed",
      data: user.creatorProfile
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to complete setup" });
  }
};




/* =========================================================
   GET MY CREATOR PROFILE (creator dashboard)
========================================================= */
export const getMyCreatorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email role creatorProfile onboardingStatus"
    );

    if (!user || user.role !== "creator")
      return res.status(404).json({ success: false, message: "Creator profile not found" });

    return res.status(200).json({ success: true, data: user });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};



/* =========================================================
   LIST ALL CREATORS (Paginated — Home / Explore)
========================================================= */
export const listCreators = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const creators = await User.find({
      role: "creator",
      "creatorProfile.isDeactivated": false
    })
      .sort({ "creatorProfile.followersCount": -1 }) // popular first
      .skip(skip)
      .limit(limit)
      .select(
        "avatarUrl creatorProfile.displayName creatorProfile.tagline creatorProfile.categories creatorProfile.rating creatorProfile.followersCount"
      )
      .lean();

    const total = await User.countDocuments({
      role: "creator",
      "creatorProfile.isDeactivated": false
    });

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: creators.length,
      data: creators
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load creators"
    });
  }
};





/* =========================================================
   GET FULL CREATOR PUBLIC PROFILE (profile page view)
========================================================= */
export const getCreatorPublicProfile = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const creator = await User.findOne({
      _id: creatorId,
      role: "creator",
     
      "creatorProfile.isDeactivated": false
    }).select(
      "name avatarUrl creatorProfile.displayName creatorProfile.tagline creatorProfile.fullBio creatorProfile.portfolio creatorProfile.categories creatorProfile.rating creatorProfile.followersCount"
    );

    if (!creator)
      return res.status(404).json({
        success: false,
        message: "Creator profile not found"
      });

    return res.status(200).json({
      success: true,
      data: creator
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch creator profile"
    });
  }
};




/* =========================================================
   UPDATE CREATOR PROFILE
========================================================= */
export const updateCreatorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "creator")
      return res.status(403).json({
        success: false,
        message: "Only creators can update profile",
      });

    const {
      displayName,
      tagline,
      fullBio,
      portfolio,
      categories
    } = req.body;

    if (displayName) user.creatorProfile.displayName = displayName;
    if (tagline) user.creatorProfile.tagline = tagline;
    if (fullBio) user.creatorProfile.fullBio = fullBio;
    if (portfolio) user.creatorProfile.portfolio = portfolio;
    if (categories) user.creatorProfile.categories = categories;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Creator profile updated",
      data: user.creatorProfile,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
};




/* =========================================================
   DEACTIVATE CREATOR MODE (pause creator account)
========================================================= */
export const deactivateCreatorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "creator")
      return res.status(403).json({ success: false, message: "Only creators can deactivate profile" });

    user.creatorProfile.isDeactivated = true;

    user.role = "user";
    user.onboardingStatus = "creator_deactivated";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Creator profile deactivated"
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to deactivate" });
  }
};




/* =========================================================
   REACTIVATE CREATOR MODE
========================================================= */
export const reactivateCreatorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.creatorProfile)
      return res.status(400).json({ success: false, message: "Creator profile not found" });

    user.creatorProfile.isDeactivated = false;

    user.role = "creator";
    user.onboardingStatus = "creator_completed";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Creator profile reactivated"
    });

  } catch {
    return res.status(500).json({ success: false, message: "Reactivation failed" });
  }
};

/* =========================================================
   LIST CREATORS BY CATEGORY
========================================================= */
export const listCreatorsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const creators = await User.find({
      role: "creator",
      "creatorProfile.isDeactivated": false,
      "creatorProfile.categories": categoryId
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "avatarUrl creatorProfile.displayName creatorProfile.tagline creatorProfile.categories creatorProfile.rating creatorProfile.followersCount"
      )
      .lean();

    const total = await User.countDocuments({
      role: "creator",
      "creatorProfile.isDeactivated": false,
      "creatorProfile.categories": categoryId
    });

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: creators.length,
      data: creators
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load category creators"
    });
  }
};

/* =========================================================
   SEARCH CREATORS (Paginated)
========================================================= */
export const searchCreators = async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q)
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const filter = {
      role: "creator",
      "creatorProfile.isDeactivated": false,
      $or: [
        { "creatorProfile.displayName": { $regex: q, $options: "i" } },
        { "creatorProfile.tagline": { $regex: q, $options: "i" } },
        { "creatorProfile.fullBio": { $regex: q, $options: "i" } }
      ]
    };

    const results = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "avatarUrl creatorProfile.displayName creatorProfile.tagline creatorProfile.categories creatorProfile.rating creatorProfile.followersCount"
      )
      .lean();

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: results.length,
      data: results
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Creator search failed"
    });
  }
};
