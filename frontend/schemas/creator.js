import { z } from 'zod';

export const creatorSetupSchema = z.object({
  displayName: z.string().min(3, 'Display name must be at least 3 characters').max(50),
  tagline: z.string().max(100).optional(),
  fullBio: z.string().min(20, 'Bio must be at least 20 characters'),
  portfolio: z.array(z.string().url()).optional(),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
});

export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  shortDescription: z.string().max(180).optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  categoryId: z.string().min(1, 'Category is required'),
  estimatedPrice: z.number().positive().optional(),
  isCustomizable: z.boolean().optional(),
  metadata: z.object({
    materialsUsed: z.array(z.string()).optional(),
    estimatedCreationTime: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  }).optional(),
});

export const tutorialSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  type: z.enum(['video', 'article', 'guide']),
  videoUrl: z.string().url().optional(),
  duration: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  categoryId: z.string().min(1, 'Category is required'),
  materials: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
});
