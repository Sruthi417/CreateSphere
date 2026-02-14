import User from "../modules/users/user.model.js";
import Product from "../modules/products/product.model.js";
import Tutorial from "../modules/tutorials/tutorial.model.js";
import Review from "../modules/reviews/review.model.js";

/**
 * Check if a creator is eligible for verification:
 * - At least one product (active) with at least 1 review, OR
 * - At least one tutorial/course (active) with at least 1 review.
 * If eligible and not already verified/requested, automatically set
 * verificationStatus = "requested" so admin sees them in the queue.
 * @param {string} creatorId - Creator (user) _id
 */
export async function checkAndAutoVerify(creatorId) {
  if (!creatorId) return;
  try {
    const user = await User.findById(creatorId).select("role creatorProfile").lean();
    if (!user || user.role !== "creator" || !user.creatorProfile) return;

    const { verified, verificationStatus } = user.creatorProfile || {};
    if (verified) return;
    if (verificationStatus && verificationStatus !== "none") return;

    const productIds = await Product.find({ creatorId, status: "active" }).distinct("_id");
    const tutorialIds = await Tutorial.find({ creatorId, status: "active" }).distinct("_id");

    const hasProductWithReview =
      productIds.length > 0 &&
      (await Review.exists({ targetType: "product", targetId: { $in: productIds } }));
    const hasTutorialWithReview =
      tutorialIds.length > 0 &&
      (await Review.exists({ targetType: "tutorial", targetId: { $in: tutorialIds } }));

    const isEligible = hasProductWithReview || hasTutorialWithReview;
    if (!isEligible) return;

    await User.findByIdAndUpdate(creatorId, {
      $set: {
        "creatorProfile.verificationStatus": "requested",
        "creatorProfile.verificationRequestedAt": new Date(),
      },
    });
  } catch (err) {
    console.error("checkAndAutoVerify error:", err);
  }
}
