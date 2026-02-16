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

  // If it's a backend upload, prepend server URL
  if (url.startsWith('/uploads')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    return `${baseUrl}${url}`;
  }

  return url;
}

export function getSafeHostname(url) {
  if (!url) return '';
  try {
    // Add protocol if missing to prevent "Invalid URL" error
    const urlWithProtocol = url.match(/^[a-zA-Z]+:\/\//) ? url : `https://${url}`;
    return new URL(urlWithProtocol).hostname.replace('www.', '');
  } catch (error) {
    console.error('URL Parsing Error:', error);
    return url; // Fallback to raw string if still invalid
  }
}
