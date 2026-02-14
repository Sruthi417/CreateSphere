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
   - Using reportsCount as the strike indicator
   - Threshold 3 -> auto-hide
======================================================= */
export const applyModerationStrike = async (target, targetType, reasonText) => {

  const currentStrikes = target.reportsCount || 0;

  /* =======================================================
     CASE 1 — USER / CREATOR REPORTS
     => ALWAYS admin review (no auto-action)
  ======================================================= */
  if (targetType === "creator" || targetType === "user") {
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
  if (currentStrikes < 3) {
    await target.save();

    await notifyUser(
      target.creatorId,
      `⚠ Warning issued: ${reasonText}`
    );

    return "warning_only";
  }

  // Strike 3 → auto-hide content
  if (currentStrikes >= 3) {
    if (target.status) target.status = "hidden";
    target.isBlocked = true;

    await target.save();

    await notifyUser(
      target.creatorId,
      "⛔ Your content was automatically hidden due to multiple reports"
    );

    return "temporarily_hidden";
  }

  return "stored";
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

  switch (action) {

    /* Issue warning */
    case "warn":
      await notifyUser(user._id, "⚠ Warning issued — " + reason);
      break;


    /* Suspend account */
    case "suspend":
      user.isBlocked = true;
      await notifyUser(user._id, "⛔ Account suspended — " + reason);
      break;


    /* Indefinite Hide */
    case "hide":
      user.isBlocked = true;
      await notifyUser(user._id, "⚠ Your profile has been hidden by an admin — " + reason);
      break;


    /* Permanent ban */
    case "ban":
      user.isBlocked = true;
      await notifyUser(user._id, "❌ Your account has been permanently banned");

      if (user.role === "creator") {
        // hide all creator content
        await Product.updateMany(
          { creatorId: user._id },
          { status: "hidden", isBlocked: true }
        );

        await Tutorial.updateMany(
          { creatorId: user._id },
          { status: "hidden", isBlocked: true }
        );
      }
      break;


    /* Reinstate */
    case "reinstate":
      user.isBlocked = false;
      await notifyUser(user._id, "✅ Account reinstated");
      break;


    default:
      throw new Error("Invalid moderation action");
  }

  await user.save();
  return user;
};
