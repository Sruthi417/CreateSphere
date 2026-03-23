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
   MODERATION TRACKING (Used by REPORT SYSTEM)
   - Only records the count and logs the report for admin review
======================================================= */
export const applyModerationStrike = async (target, targetType, reasonText) => {
  // We simply save the target to ensure the report count increment (handled in controller) is persisted
  // and send a notification stub. No automatic actions like hiding or blocking.

  await target.save();

  // Notification for the content owner/creator
  const ownerId = targetType === "creator" || targetType === "user" ? target._id : target.creatorId;

  if (ownerId) {
    await notifyUser(
      ownerId,
      `⚠ An item you own has been reported for: ${reasonText}. This has been sent for admin review.`
    );
  }

  return "reported_to_admin";
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
      user.status = "suspended";
      await notifyUser(user._id, "⛔ Account suspended — " + reason);

      if (user.role === "creator") {
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

    /* Indefinite Hide */
    case "hide":
      user.isBlocked = true;
      user.status = "hidden";
      await notifyUser(user._id, "⚠ Your profile has been hidden by an admin — " + reason);

      if (user.role === "creator") {
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


    /* Permanent ban */
    case "ban":
      user.isBlocked = true;
      user.status = "banned";
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
      user.status = "active";
      await notifyUser(user._id, "✅ Account reinstated");
      break;


    default:
      throw new Error("Invalid moderation action");
  }

  await user.save();
  return user;
};
