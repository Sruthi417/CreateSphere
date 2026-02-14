import Tutorial from "./tutorial.model.js";
import User from "../users/user.model.js";
import { checkAndAutoVerify } from "../../utils/verification.utils.js";


/* =========================================================
   CREATE TUTORIAL (Creator Upload)
========================================================= */
export const createTutorial = async (req, res) => {
  try {
    const creatorId = req.user.id;

    const creator = await User.findById(creatorId);

    if (!creator || creator.role !== "creator") {
      return res.status(403).json({
        success: false,
        message: "Only creators can publish tutorials",
      });
    }

    const tutorial = await Tutorial.create({
      creatorId,
      ...req.body,
      status: "active",
    });

    creator.creatorProfile.tutorials.push(tutorial._id);
    await creator.save();

    await checkAndAutoVerify(creatorId);

    return res.status(201).json({
      success: true,
      message: "Tutorial published successfully",
      data: tutorial,
    });

  } catch {
    return res.status(400).json({
      success: false,
      message: "Failed to create tutorial",
    });
  }
};



/* =========================================================
   GET SINGLE PUBLIC TUTORIAL (Full Page View)
========================================================= */
export const getTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({
      _id: req.params.tutorialId,
      status: "active",
      visibility: "public",
    })
      .populate("creatorId", "name avatarUrl creatorProfile")
      .populate("categoryId", "name");

    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: "Tutorial not found",
      });
    }

    const isEnrolled = req.user
      ? await User.exists({ _id: req.user.id, enrolledTutorials: tutorial._id })
      : false;

    return res.status(200).json({
      success: true,
      data: {
        ...tutorial.toObject(),
        isEnrolled
      },
    });

  } catch (error) {
    console.error("getTutorial error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tutorial",
    });
  }
};



/* =========================================================
   LIST ALL PUBLIC TUTORIALS (Paginated — Explore)
========================================================= */
export const listAllTutorials = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const sort =
      req.query.sort === "oldest"
        ? { createdAt: 1 }
        : { createdAt: -1 };

    const tutorials = await Tutorial.find({
      status: "active",
      visibility: "public",
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(
        "title thumbnailUrl creatorId categoryId averageRating reviewsCount type createdAt description"
      )
      .lean();

    // Auto-generate card preview text
    tutorials.forEach(t => {
      t.shortDescription =
        t.description
          ? t.description.slice(0, 120) + "..."
          : "";
    });

    const total = await Tutorial.countDocuments({
      status: "active",
      visibility: "public",
    });

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: tutorials.length,
      data: tutorials,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load tutorials",
    });
  }
};



/* =========================================================
   LIST TUTORIALS BY CATEGORY (Paginated)
========================================================= */
export const listTutorialsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const tutorials = await Tutorial.find({
      categoryId,
      status: "active",
      visibility: "public",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "title thumbnailUrl creatorId averageRating reviewsCount type createdAt description"
      )
      .lean();

    tutorials.forEach(t => {
      t.shortDescription =
        t.description
          ? t.description.slice(0, 120) + "..."
          : "";
    });

    const total = await Tutorial.countDocuments({
      categoryId,
      status: "active",
      visibility: "public",
    });

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: tutorials.length,
      data: tutorials,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load category tutorials",
    });
  }
};



/* =========================================================
   LIST CREATOR PUBLIC TUTORIALS (Profile)
========================================================= */
export const listCreatorTutorials = async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const tutorials = await Tutorial.find({
      creatorId,
      status: "active",
      visibility: "public",
    })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tutorials.length,
      data: tutorials,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tutorials",
    });
  }
};



/* =========================================================
   CREATOR DASHBOARD — LIST MY TUTORIALS
========================================================= */
export const listMyTutorials = async (req, res) => {
  try {
    const tutorials = await Tutorial.find({
      creatorId: req.user.id,
    })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tutorials.length,
      data: tutorials,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to load your tutorials",
    });
  }
};



/* =========================================================
   UPDATE TUTORIAL
========================================================= */
export const updateTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({
      _id: req.params.tutorialId,
      creatorId: req.user.id,
    });

    if (!tutorial)
      return res.status(404).json({
        success: false,
        message: "Tutorial not found",
      });

    if (tutorial.status === "removed") {
      return res.status(400).json({
        success: false,
        message: "Restore tutorial before editing",
      });
    }

    Object.assign(tutorial, req.body);

    if (tutorial.status === "hidden") {
      if (tutorial.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "This tutorial is blocked by an admin and cannot be reactivated manually."
        });
      }
      tutorial.status = "active";
    }

    await tutorial.save();

    return res.status(200).json({
      success: true,
      message: "Tutorial updated",
      data: tutorial,
    });

  } catch {
    return res.status(400).json({
      success: false,
      message: "Failed to update tutorial",
    });
  }
};



/* =========================================================
   SOFT DELETE TUTORIAL
========================================================= */
export const removeTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({
      _id: req.params.tutorialId,
      creatorId: req.user.id,
    });

    if (!tutorial)
      return res.status(404).json({
        success: false,
        message: "Tutorial not found",
      });

    tutorial.status = "removed";
    await tutorial.save();

    return res.status(200).json({
      success: true,
      message: "Tutorial removed (can be restored)",
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to remove tutorial",
    });
  }
};



/* =========================================================
   RESTORE TUTORIAL
========================================================= */
export const restoreTutorial = async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({
      _id: req.params.tutorialId,
      creatorId: req.user.id,
      status: "removed",
    });

    if (!tutorial)
      return res.status(404).json({
        success: false,
        message: "Tutorial not found or not removed",
      });

    tutorial.status = "active";

    await tutorial.save();

    return res.status(200).json({
      success: true,
      message: "Tutorial restored",
      data: tutorial,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to restore tutorial",
    });
  }
};



/* =========================================================
   SEARCH TUTORIALS (Paginated)
========================================================= */
export const searchTutorials = async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q)
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;

    const filter = {
      status: "active",
      visibility: "public",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
    };

    const results = await Tutorial.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "title thumbnailUrl creatorId averageRating reviewsCount type createdAt description tags"
      )
      .lean();

    results.forEach(t => {
      t.shortDescription =
        t.description
          ? t.description.slice(0, 120) + "..."
          : "";
    });

    const total = await Tutorial.countDocuments(filter);

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: results.length,
      data: results,
    });

  } catch {
    return res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};


/* =========================================================
   ENROLL IN TUTORIAL
========================================================= */
export const enrollTutorial = async (req, res) => {
  try {
    const { tutorialId } = req.params;
    const userId = req.user.id;

    const tutorial = await Tutorial.findById(tutorialId);
    if (!tutorial) {
      return res.status(404).json({ success: false, message: "Tutorial not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.enrolledTutorials.includes(tutorialId)) {
      return res.status(200).json({
        success: true,
        message: "Already enrolled",
        data: { isEnrolled: true }
      });
    }

    user.enrolledTutorials.push(tutorialId);
    await user.save();

    // Increment learners count (using reviewsCount as proxy or adding learners field)
    tutorial.reviewsCount = (tutorial.reviewsCount || 0) + 1;
    await tutorial.save();

    return res.status(200).json({
      success: true,
      message: "Enrolled successfully",
      data: { isEnrolled: true }
    });

  } catch (error) {
    console.error("enroll error:", error);
    return res.status(500).json({ success: false, message: "Failed to enroll" });
  }
};
