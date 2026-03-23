import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'createsphere_uploads',
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp', 'gif'],
  },
});

// Create multer instance
export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

export default uploadMiddleware;
