import {
  findTargetItem,
  notifyUser
} from "../../utils/moderation.utils.js";


/* -------------------------------------------------------
   ADMIN — TEMP HIDE CONTENT (7 days)
------------------------------------------------------- */
export const adminHideContent = async (req, res) => {
  try {
    const { targetId, targetType } = req.params;
    const { reason } = req.body;

    const item = await findTargetItem(targetId, targetType);
    if (!item) return res.status(404).json({ success: false });

    item.status = "hidden";
    item.isBlocked = true;

    await item.save();

    await notifyUser(
      item.creatorId,
      "⚠ Content was hidden by admin — " + reason
    );

    return res.status(200).json({ success: true });

  } catch {
    return res.status(500).json({ success: false });
  }
};


/* -------------------------------------------------------
   ADMIN — RESTORE CONTENT
------------------------------------------------------- */
export const adminRestoreContent = async (req, res) => {
  try {
    const { targetId, targetType } = req.params;

    const item = await findTargetItem(targetId, targetType);
    if (!item) return res.status(404).json({ success: false });

    item.status = "active";
    item.isBlocked = false;

    await item.save();

    await notifyUser(item.creatorId, "✅ Content restored");

    return res.status(200).json({ success: true });

  } catch {
    return res.status(500).json({ success: false });
  }
};


/* -------------------------------------------------------
   ADMIN — PERMANENT REMOVE CONTENT
------------------------------------------------------- */
export const adminRemoveContent = async (req, res) => {
  try {
    const { targetId, targetType } = req.params;
    const { reason } = req.body;

    const item = await findTargetItem(targetId, targetType);
    if (!item) return res.status(404).json({ success: false });

    item.status = "removed";
    item.isBlocked = true;

    await item.save();

    await notifyUser(
      item.creatorId,
      " Content permanently removed — " + reason
    );

    return res.status(200).json({ success: true });

  } catch {
    return res.status(500).json({ success: false });
  }
};
