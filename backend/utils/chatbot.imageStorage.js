import cloudinary from "../config/cloudinary.js";

/**
 * Uploads base64 image into Cloudinary
 * Returns full public URL
 */
export const saveBase64ToPngUrl = async (base64, sessionId) => {
  if (!base64) throw new Error("base64 image required");

  const cleanBase64 = base64.includes("base64,")
    ? base64
    : `data:image/png;base64,${base64}`;

  const result = await cloudinary.uploader.upload(cleanBase64, {
    folder: `createsphere_chatbot/${sessionId}`
  });

  return result.secure_url;
};

/**
 * Delete all images stored in Cloudinary for this session
 */
export const deleteSessionImages = async (sessionId) => {
  try {
    await cloudinary.api.delete_resources_by_prefix(`createsphere_chatbot/${sessionId}`);
  } catch (err) {
    console.error("Failed to delete from cloudinary", err);
  }
};
