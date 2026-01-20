import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../users/user.model.js";
import Product from "../products/product.model.js";
import Tutorial from "../tutorials/tutorial.model.js";
import Report from "../reports/report.model.js";

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
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token
    });

  } catch {
    console.error("login error:", err);
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

    ranked.sort((a,b) => b.priorityScore - a.priorityScore);

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
    const reports = await Report.aggregate([
      {
        $group: {
          _id: { targetId: "$targetId", targetType: "$targetType" },
          count: { $sum: 1 },
          latestAt: { $max: "$createdAt" }
        }
      },
      { $sort: { count: -1, latestAt: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: reports
    });

  } catch {
    console.error("priority report error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load reports"
    });
  }
};


/* =========================================================
   USER / CREATOR MANUAL MODERATION
========================================================= */
export const adminModerateAccount = async (req, res) => {
  try {
    const { targetId } = req.params;
    const { action, reason } = req.body;

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
