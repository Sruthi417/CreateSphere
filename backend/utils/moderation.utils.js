import User from "../modules/users/user.model.js";
import Product from "../modules/products/product.model.js";
import Tutorial from "../modules/tutorials/tutorial.model.js";

/* -------------------------------------------------------
   TEMP Notification Stub (Later → push / email system)
------------------------------------------------------- */
export const notifyUser = async (userId, message) => {
  console.log("🔔 Notify:", userId, message);
};


/* -------------------------------------------------------
   Resolve moderation target by type
------------------------------------------------------- */
export const findTargetItem = async (id, type) => {

  if (type === "product") return Product.findById(id);
  if (type === "tutorial") return Tutorial.findById(id);

  // creators + users are both in User collection
  if (type === "creator" || type === "user")
    return User.findById(id);

  return null;
};



/* =======================================================
   AUTO-MODERATION (Used by REPORT SYSTEM)
   - Strike 1–2 → warning only
   - Strike 3 → auto-hide 7 days
   - Strike 4+ → escalate to admin
======================================================= */
export const applyModerationStrike = async (target, targetType, reasonText) => {
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Get correct moderation object
  const mod =
    targetType === "creator"
      ? target.creatorProfile.moderation
      : target.moderation;

  mod.strikeCount = (mod.strikeCount || 0) + 1;

  /* =======================================================
     CASE 1 — USER / CREATOR REPORTS
     => ALWAYS admin review (no auto-action)
  ======================================================= */
  if (targetType === "creator" || targetType === "user") {

    mod.reason = `Requires manual admin review — ${reasonText}`;

    await target.save();
    await notifyUser(
      target._id,
      "⚠ Your account has been reported and sent to admin review"
    );

    return "admin_review_required";
  }

  /* =======================================================
     CASE 2 — CONTENT STRIKES (PRODUCT / TUTORIAL)
  ======================================================= */

  // Strike 1–2 → warning only
  if (mod.strikeCount < 3) {

    mod.reason = `⚠ Warning issued: ${reasonText}`;
    await target.save();

    await notifyUser(
      target.creatorId,
      mod.reason
    );

    return "warning_only";
  }

  // Strike 3 → auto-hide content 7 days
  if (mod.strikeCount === 3) {

    mod.reason = "Content hidden due to repeated user reports";
    mod.hiddenUntil = sevenDaysLater;

    if (target.status) target.status = "hidden";

    await target.save();

    await notifyUser(
      target.creatorId,
      "⛔ Your content was automatically hidden for 7 days due to reports"
    );

    return "temporarily_hidden";
  }

  // Strike 4+ → admin review only
  mod.reason = "Repeated reports — escalated to admin review";
  await target.save();

  return "admin_review_required";
};


/* =======================================================
   MANUAL MODERATION (ADMIN ACTIONS)
======================================================= */
export const applyModerationAction = async ({
  targetId,
  action,
  reason
}) => {

  const user = await User.findById(targetId);
  if (!user) throw new Error("User not found");

  const mod = user.moderation;

  switch (action) {

    /* Issue warning */
    case "warn":
      mod.strikeCount++;
      mod.status = "warned";
      mod.lastReason = reason;

      await notifyUser(user._id, "⚠ Warning issued — " + reason);
      break;


    /* Suspend account */
    case "suspend":
      mod.strikeCount++;
      mod.status = "suspended";
      mod.suspendedUntil =
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await notifyUser(user._id, "⛔ Account suspended for 7 days");
      break;


    /* Permanent ban */
    case "ban":
      mod.status = "banned";
      mod.lastReason = reason;

      await notifyUser(user._id, "❌ Your account has been permanently banned");

      if (user.role === "creator") {

        // hide all creator content
        await Product.updateMany(
          { creatorId: user._id },
          { status: "hidden" }
        );

        await Tutorial.updateMany(
          { creatorId: user._id },
          { status: "hidden" }
        );

        user.creatorProfile.isDeactivated = true;
      }
      break;


    /* Reinstate */
    case "reinstate":
      mod.status = "active";
      mod.suspendedUntil = null;
      mod.lastReason = null;

      await notifyUser(user._id, "✅ Account reinstated");

      if (user.role === "creator") {
        user.creatorProfile.isDeactivated = false;
      }
      break;


    default:
      throw new Error("Invalid moderation action");
  }

  await user.save();
  return user;
};
