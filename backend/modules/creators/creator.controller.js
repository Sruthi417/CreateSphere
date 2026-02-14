import User from "../users/user.model.js";
import Product from "../products/product.model.js";
import Review from "../reviews/review.model.js";

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
      verificationStatus: "none",
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
        "_id avatarUrl creatorProfile.displayName creatorProfile.tagline creatorProfile.categories creatorProfile.rating creatorProfile.followersCount creatorProfile.followers"
      )
      .lean();

    const total = await User.countDocuments({
      role: "creator",
      "creatorProfile.isDeactivated": false
    });

    // Add isFollowing for logged-in users
    const creatorsWithFollowStatus = creators.map(creator => {
      const isFollowing = req.user ?
        creator.creatorProfile.followers.some(id => id.toString() === req.user.id.toString()) :
        false;

      return {
        ...creator,
        isFollowing,
        // Remove followers array from response for security
        creatorProfile: {
          ...creator.creatorProfile,
          followers: undefined
        }
      };
    });

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: creators.length,
      data: creatorsWithFollowStatus
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
      "_id name avatarUrl creatorProfile.displayName creatorProfile.tagline creatorProfile.fullBio creatorProfile.portfolio creatorProfile.categories creatorProfile.rating creatorProfile.followersCount creatorProfile.followers"
    );

    if (!creator)
      return res.status(404).json({
        success: false,
        message: "Creator profile not found"
      });

    // Compute isFollowing for logged-in user
    const isFollowing = req.user ?
      creator.creatorProfile.followers.some(id => id.toString() === req.user.id.toString()) :
      false;

    // Build response with followers array removed for security
    const creatorData = creator.toObject ? creator.toObject() : creator;
    const responseData = {
      ...creatorData,
      isFollowing,
      creatorProfile: {
        ...creatorData.creatorProfile,
        followers: undefined
      }
    };

    return res.status(200).json({
      success: true,
      data: responseData
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
        "_id avatarUrl creatorProfile.displayName creatorProfile.tagline creatorProfile.categories creatorProfile.rating creatorProfile.followersCount creatorProfile.followers"
      )
      .lean();

    const total = await User.countDocuments({
      role: "creator",
      "creatorProfile.isDeactivated": false,
      "creatorProfile.categories": categoryId
    });

    // Add isFollowing for logged-in users
    const creatorsWithFollowStatus = creators.map(creator => {
      const isFollowing = req.user ?
        creator.creatorProfile.followers.some(id => id.toString() === req.user.id.toString()) :
        false;

      return {
        ...creator,
        isFollowing,
        creatorProfile: {
          ...creator.creatorProfile,
          followers: undefined
        }
      };
    });

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: creators.length,
      data: creatorsWithFollowStatus
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
        "_id avatarUrl creatorProfile.displayName creatorProfile.tagline creatorProfile.categories creatorProfile.rating creatorProfile.followersCount creatorProfile.followers"
      )
      .lean();

    const total = await User.countDocuments(filter);

    // Add isFollowing for logged-in users
    const resultsWithFollowStatus = results.map(creator => {
      const isFollowing = req.user ?
        creator.creatorProfile.followers.some(id => id.toString() === req.user.id.toString()) :
        false;

      return {
        ...creator,
        isFollowing,
        creatorProfile: {
          ...creator.creatorProfile,
          followers: undefined
        }
      };
    });

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: results.length,
      data: resultsWithFollowStatus
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Creator search failed"
    });
  }
};

/* =========================================================
   CHECK VERIFICATION ELIGIBILITY
========================================================= */
export const checkVerificationEligibility = async (req, res) => {
  try {
    const creatorId = req.user.id;

    // Count products
    const productCount = await Product.countDocuments({
      creatorId,
      status: 'active'
    });

    // Count reviews across all content
    const reviewCount = await Review.countDocuments({
      creatorId
    });

    const criteria = {
      minProducts: 2,
      minReviews: 3,
      currentProducts: productCount,
      currentReviews: reviewCount,
      isEligible: productCount >= 2 && reviewCount >= 3
    };

    return res.status(200).json({
      success: true,
      data: criteria
    });

  } catch (error) {
    console.error("eligibility check error:", error);
    return res.status(500).json({ success: false, message: "Failed to check eligibility" });
  }
};

/* =========================================================
   APPLY FOR VERIFICATION
========================================================= */
export const applyForVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'creator') {
      return res.status(403).json({ success: false, message: "Only creators can apply" });
    }

    if (user.creatorProfile.verified) {
      return res.status(400).json({ success: false, message: "You are already verified" });
    }

    if (user.creatorProfile.verificationStatus === 'requested') {
      return res.status(400).json({ success: false, message: "Verification already requested" });
    }

    // Eligibility check
    const productCount = await Product.countDocuments({ creatorId: user._id, status: 'active' });
    const reviewCount = await Review.countDocuments({ creatorId: user._id });

    if (productCount < 2 || reviewCount < 3) {
      return res.status(400).json({
        success: false,
        message: "You do not meet the eligibility criteria (2 products, 3 reviews)"
      });
    }

    user.creatorProfile.verificationStatus = "requested";
    user.creatorProfile.verificationRequestedAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Verification request submitted successfully"
    });

  } catch (error) {
    console.error("apply verification error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit request" });
  }
};
