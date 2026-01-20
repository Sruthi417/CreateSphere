import Review from "../modules/reviews/review.model.js";
import User from "../modules/users/user.model.js";
import Product from "../modules/products/product.model.js";
import Tutorial from "../modules/tutorials/tutorial.model.js";


/* =========================================================
   RECALCULATE ITEM RATING (ignores comment-only reviews)
========================================================= */
export const updateTargetReviewStats = async (targetId, targetType) => {

  const stats = await Review.aggregate([
    { 
      $match: { 
        targetId,
        targetType,
        rating: { $ne: null }   // ⭐ only count ratings
      } 
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      }
    }
  ]);

  const s = stats[0] || { avgRating: 0, count: 0 };

  const update = {
    averageRating: Number(s.avgRating.toFixed(2)),
    reviewsCount: s.count,
  };

  let creatorId;

  if (targetType === "product") {
    const item = await Product.findByIdAndUpdate(targetId, update);
    creatorId = item?.creatorId;
  } else {
    const item = await Tutorial.findByIdAndUpdate(targetId, update);
    creatorId = item?.creatorId;
  }

  if (creatorId) {
    await recalculateCreatorRating(creatorId);
  }
};


/* =========================================================
   CREATOR RATING = weighted rating from all rated items
========================================================= */
export const recalculateCreatorRating = async (creatorId) => {

  const stats = await Review.aggregate([
    { 
      $match: { 
        creatorId,
        rating: { $ne: null }   // ⭐ ignore comment-only reviews
      }
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$rating" },
      }
    }
  ]);

  const avg = stats[0]?.avg || 0;

  await User.updateOne(
    { _id: creatorId },
    { $set: { "creatorProfile.rating": Number(avg.toFixed(2)) } }
  );
};
