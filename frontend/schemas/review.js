import { z } from 'zod';

export const reviewSchema = z.object({
  targetId: z.string().min(1, 'Target is required'),
  targetType: z.enum(['product', 'tutorial']),
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export const reportSchema = z.object({
  targetId: z.string().min(1, 'Target is required'),
  targetType: z.enum(['product', 'tutorial', 'creator', 'user']),
  reasonCode: z.enum(['spam', 'harassment', 'misleading', 'copyright', 'inappropriate', 'scam']),
  additionalNote: z.string().max(500).optional(),
});
