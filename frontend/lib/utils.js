import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
