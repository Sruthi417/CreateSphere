import Report from "./report.model.js";
import { findTargetItem, applyModerationStrike } from "../../utils/moderation.utils.js";

/* =========================================================
   SUBMIT REPORT
========================================================= */
export const submitReport = async (req, res) => {
  try {
    const { targetId, targetType, reasonCode, additionalNote } = req.body;
    const reporterId = req.user.id;

    // Prevent duplicate report by same user
    const existing = await Report.findOne({
      reporterId,
      targetId,
      targetType
    });

    if (existing)
      return res.status(400).json({
        success: false,
        message: "You have already reported this item"
      });


    const target = await findTargetItem(targetId, targetType);

    if (!target)
      return res.status(404).json({
        success: false,
        message: "Reported item not found"
      });

    const creatorId =
      target.creatorId ||
      target.creatorProfile?._id ||
      target._id;

    await Report.create({
      reporterId,
      creatorId,
      targetId,
      targetType,
      reasonCode,
      additionalNote
    });

    // Increment reportsCount on the target object
    target.reportsCount = (target.reportsCount || 0) + 1;

    if (targetType === "creator" || targetType === "user") {
      if (target.moderation) {
        target.moderation.strikeCount = (target.moderation.strikeCount || 0) + 1;
      }
    }

    // Count total instances in Report collection (as backup/verification)
    const reportCount = await Report.countDocuments({ targetId, targetType });

    let action = "stored";

    // Automoderation if threshold reached
    if (reportCount >= 3) {
      action = await applyModerationStrike(
        target,
        targetType,
        reasonCode
      );
    }

    await target.save();

    return res.status(201).json({
      success: true,
      message: "Report submitted",
      action
    });

  } catch {
    console.error("Submit report error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to submit report"
    });
  }
};


/* =========================================================
   VIEW REPORTS FOR A TARGET (Creator Dashboard)
========================================================= */
export const getReportsForTarget = async (req, res) => {
  try {
    const { targetId, targetType } = req.params;

    const reports = await Report.find({ targetId, targetType })
      .sort({ createdAt: -1 })
      .populate("reporterId", "name avatarUrl");

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });

  } catch {
    console.error("view report error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load reports"
    });
  }
};
