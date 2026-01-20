import Product from "../modules/products/product.model.js";
import Tutorial from "../modules/tutorials/tutorial.model.js";

export const computeCreatorPriorityScore = async (creator) => {

  const creatorId = creator._id;

  const uploads =
    await Product.countDocuments({ creatorId }) +
    await Tutorial.countDocuments({ creatorId });

  let score = 0;

  // Upload activity
  if (uploads >= 10) score += 4;
  else if (uploads >= 5) score += 3;
  else if (uploads >= 2) score += 2;
  else score += 1;

  // Followers
  if (creator.creatorProfile.followersCount >= 50) score += 3;
  else if (creator.creatorProfile.followersCount >= 10) score += 2;

  // Ratings
  if (creator.creatorProfile.rating >= 4.5) score += 3;
  else if (creator.creatorProfile.rating >= 4.0) score += 2;

  return score;
};
