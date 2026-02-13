import Review from "./review.model.js";
import Product from "../products/product.model.js";
import Tutorial from "../tutorials/tutorial.model.js";
import { updateTargetReviewStats } from "../../utils/review.utils.js";
import { checkAndAutoVerify } from "../../utils/verification.utils.js";



/* =========================================================
   CREATE REVIEW (rating or comment or both)
========================================================= */
export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId, targetType, rating, comment } = req.body;

    if (!["product", "tutorial"].includes(targetType))
      return res.status(400).json({ success: false, message: "Invalid review type" });


    let item =
      targetType === "product"
        ? await Product.findById(targetId)
        : await Tutorial.findById(targetId);

    if (!item)
      return res.status(404).json({ success: false, message: "Target not found" });


    // user may create comment OR rating OR both
    const review = await Review.create({
      userId,
      creatorId: item.creatorId,
      targetId,
      targetType,
      rating: rating ?? null,
      comment: comment ?? "",
    });


    await updateTargetReviewStats(targetId, targetType);

    // Trigger auto-verification check for the creator
    if (item.creatorId) {
      await checkAndAutoVerify(item.creatorId);
    }

    return res.status(201).json({
      success: true,
      message: "Feedback submitted",
      data: review,
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to submit review" });
  }
};



/* =========================================================
   UPDATE REVIEW (either field)
========================================================= */
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      userId: req.user.id,
    });

    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    if (req.body.rating !== undefined)
      review.rating = req.body.rating || null;

    if (req.body.comment !== undefined)
      review.comment = req.body.comment;

    await review.save();

    await updateTargetReviewStats(review.targetId, review.targetType);

    return res.status(200).json({
      success: true,
      message: "Feedback updated",
      data: review,
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to update review" });
  }
};



/* =========================================================
   DELETE REVIEW
========================================================= */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      userId: req.user.id,
    });

    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    await updateTargetReviewStats(review.targetId, review.targetType);

    return res.status(200).json({
      success: true,
      message: "Feedback removed",
    });

  } catch {
    return res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};



/* =========================================================
   GET ALL FEEDBACK (ratings + comments)
========================================================= */
export const getReviews = async (req, res) => {
  try {
    const { targetId, targetType } = req.params;

    const reviews = await Review.find({ targetId, targetType })
      .sort({ createdAt: -1 })
      .populate("userId", "name avatarUrl")
      .lean();

    // guarantee avatar value exists in response
    reviews.forEach(r => {
      r.user = {
        _id: r.userId._id,
        name: r.userId.name,
        avatarUrl: r.userId.avatarUrl || null
      };

      delete r.userId;
    });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to load feedback"
    });
  }
};
