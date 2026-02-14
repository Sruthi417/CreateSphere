import Report from "../reports/report.model.js";
import { applyModerationAction } from "../../utils/moderation.utils.js";


export const adminResolveUserReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, reason } = req.body;

    const report = await Report.findById(reportId);

    if (!report || !["creator", "user"].includes(report.targetType))
      return res.status(404).json({ success: false });

    const user = await applyModerationAction({
      targetId: report.targetId,
      action,
      reason
    });

    report.handled = true;
    await report.save();

    return res.status(200).json({
      success: true
    });

  } catch {
    return res.status(500).json({ success: false });
  }
};
