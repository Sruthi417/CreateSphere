import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../users/user.model.js";
import Product from "../products/product.model.js";
import Tutorial from "../tutorials/tutorial.model.js";
import Report from "../reports/report.model.js";
import { JWT_SECRET } from "../../config/env.js";

import {
  applyModerationAction,
  notifyUser
} from "../../utils/moderation.utils.js";

import { computeCreatorPriorityScore } from "../../utils/priorityScore.js";


/* =========================================================
   ADMIN LOGIN
========================================================= */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "admin" })
      .select("+password");

    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_SECRET || "default_secret",
      { expiresIn: "6h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });

  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({
      success: false,
      message: "Admin login failed"
    });
  }
};


/* =========================================================
   CREATOR VERIFICATION — PRIORITY QUEUE
========================================================= */
export const listCreatorsPendingVerification = async (req, res) => {
  try {
    const creators = await User.find({
      role: "creator",
      "creatorProfile.verificationStatus": "requested",
      "creatorProfile.isDeactivated": false
    }).lean();

    const ranked = [];

    for (const c of creators) {
      ranked.push({
        ...c,
        priorityScore: await computeCreatorPriorityScore(c)
      });
    }

    ranked.sort((a, b) => b.priorityScore - a.priorityScore);

    return res.status(200).json({
      success: true,
      count: ranked.length,
      data: ranked
    });

  } catch {
    console.error("creator verification  error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load verification queue"
    });
  }
};


/* APPROVE */
export const approveCreatorVerification = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const creator = await User.findById(creatorId);

    creator.creatorProfile.verified = true;
    creator.creatorProfile.verificationStatus = "verified";
    creator.creatorProfile.verifiedAt = new Date();

    await creator.save();

    await notifyUser(creatorId, "🎉 Your creator profile is verified!");

    return res.status(200).json({ success: true });

  } catch {
    console.error("approve verification error:", err);
    return res.status(500).json({ success: false });
  }
};


/* REJECT */
export const rejectCreatorVerification = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { reason } = req.body;

    const creator = await User.findById(creatorId);

    creator.creatorProfile.verified = false;
    creator.creatorProfile.verificationStatus = "rejected";
    creator.creatorProfile.rejectionReason = reason;

    await creator.save();

    await notifyUser(creatorId, "⚠ Verification rejected — " + reason);

    return res.status(200).json({ success: true });

  } catch {
    console.error("reject verification error:", err);
    return res.status(500).json({ success: false });
  }
};


/* REVOKE */
export const revokeCreatorVerification = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const creator = await User.findById(creatorId);

    creator.creatorProfile.verified = false;
    creator.creatorProfile.verificationStatus = "revoked";

    await creator.save();

    await notifyUser(creatorId, " Verification revoked due to misconduct");

    return res.status(200).json({ success: true });

  } catch {
    console.error("revoke verification error:", err);
    return res.status(500).json({ success: false });
  }
};


/* =========================================================
   PRIORITY REPORT QUEUE (High → Low)
========================================================= */
export const listPriorityReports = async (req, res) => {
  try {
    const reportGroups = await Report.aggregate([
      {
        $group: {
          _id: { targetId: "$targetId", targetType: "$targetType" },
          count: { $sum: 1 },
          latestAt: { $max: "$createdAt" },
          reasons: { $push: "$reasonCode" },
          notes: { $push: "$additionalNote" }
        }
      },
      { $sort: { count: -1, latestAt: -1 } }
    ]);

    // Enhance groups with target and creator information
    const data = await Promise.all(reportGroups.map(async (group) => {
      let contentInfo = null;
      let creatorInfo = null;

      // 1. Fetch Target Content Info
      if (group._id.targetType === "product") {
        const p = await Product.findById(group._id.targetId).select("title images status creatorId");
        if (p) {
          contentInfo = { title: p.title, image: p.images?.[0], status: p.status };
          // Fetch creator info for this product
          const u = await User.findById(p.creatorId).select("name email avatarUrl moderation");
          if (u) creatorInfo = { name: u.name, email: u.email, avatarUrl: u.avatarUrl, moderation: u.moderation, _id: u._id };
        }
      } else if (group._id.targetType === "tutorial") {
        const t = await Tutorial.findById(group._id.targetId).select("title thumbnailUrl status creatorId");
        if (t) {
          contentInfo = { title: t.title, image: t.thumbnailUrl, status: t.status };
          // Fetch creator info for this tutorial
          const u = await User.findById(t.creatorId).select("name email avatarUrl moderation");
          if (u) creatorInfo = { name: u.name, email: u.email, avatarUrl: u.avatarUrl, moderation: u.moderation, _id: u._id };
        }
      } else if (["creator", "user"].includes(group._id.targetType)) {
        const u = await User.findById(group._id.targetId).select("name email avatarUrl moderation");
        if (u) {
          contentInfo = { name: u.name, email: u.email, avatarUrl: u.avatarUrl, moderation: u.moderation };
          creatorInfo = contentInfo; // Target IS the creator/user
        }
      }

      return {
        ...group,
        content: contentInfo,
        creator: creatorInfo
      };
    }));

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error("priority report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load reports"
    });
  }
};


/* =========================================================
   GET INDIVIDUAL REPORTS FOR A TARGET
========================================================= */
export const getReportDetails = async (req, res) => {
  try {
    const { targetId } = req.params;

    // Find reports for the specific target OR where the target is the creator
    const reports = await Report.find({
      $or: [
        { targetId },
        { creatorId: targetId }
      ]
    })
      .populate("reporterId", "name email")
      .sort("-createdAt");

    return res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load report details" });
  }
};


/* =========================================================
   USER / CREATOR / ADMIN MANUAL MODERATION
========================================================= */
export const adminModerateAccount = async (req, res) => {
  try {
    const { targetId } = req.params;
    const { action, reason } = req.body;

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });

    // SECURITY: Only Super Admin can moderate other Admins
    if (targetUser.role === "admin") {
      const requester = await User.findById(req.user.id);
      if (!requester.adminDetails?.isSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only Super Admins can moderate other Admin accounts"
        });
      }
    }

    const user = await applyModerationAction({ targetId, action, reason });

    return res.status(200).json({
      success: true,
      moderation: user.moderation
    });

  } catch (err) {
    console.error("user/creator moderation  error:", err);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


/* =========================================================
   LIST ALL ADMINS (For Super Admin management)
========================================================= */
export const listAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("name email avatarUrl moderation adminDetails createdAt")
      .lean();

    return res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load admins" });
  }
};


/* =========================================================
   DISMISS ALL REPORTS FOR A TARGET
========================================================= */
export const dismissReports = async (req, res) => {
  try {
    const { targetId } = req.params;

    // If targetId is a user, we might want to dismiss ALL reports related to them (as creator)
    // To be safe and thorough, we delete both specific target reports and creator-tagged reports
    await Report.deleteMany({
      $or: [
        { targetId },
        { creatorId: targetId }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Reports dismissed successfully"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to dismiss reports" });
  }
};


/* =========================================================
   LIST REPORTED CREATORS ONLY
========================================================= */
export const listReportedCreators = async (req, res) => {
  try {
    const reportGroups = await Report.aggregate([
      { $match: { creatorId: { $ne: null } } },
      {
        $group: {
          _id: "$creatorId",
          count: { $sum: 1 },
          latestAt: { $max: "$createdAt" },
          reasons: { $push: "$reasonCode" }
        }
      },
      { $sort: { count: -1, latestAt: -1 } }
    ]);

    const data = await Promise.all(reportGroups.map(async (group) => {
      // Find the user who is the creator (could be role "creator" or "admin" if an admin was reported)
      const u = await User.findById(group._id)
        .select("name email avatarUrl moderation creatorProfile role");

      if (!u) return null;

      return {
        _id: { targetId: group._id, targetType: u.role === "creator" ? "creator" : "user" },
        count: group.count,
        latestAt: group.latestAt,
        reasons: group.reasons,
        content: {
          name: u.name,
          email: u.email,
          avatarUrl: u.avatarUrl,
          moderation: u.moderation,
          creatorProfile: u.creatorProfile,
          role: u.role
        }
      };
    }));

    return res.status(200).json({
      success: true,
      data: data.filter(d => d !== null)
    });
  } catch (error) {
    console.error("listReportedCreators error:", error);
    return res.status(500).json({ success: false, message: "Failed to load reported creators" });
  }
};
