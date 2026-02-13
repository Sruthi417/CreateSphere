'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userAPI } from '@/lib/api-client';
import { toast } from 'sonner';
import { Camera, Loader2, Upload } from 'lucide-react';

export default function AvatarUpload({ currentAvatar, onSuccess, fallback, className = "h-24 w-24" }) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(currentAvatar);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsLoading(true);
    try {
      // userAPI.uploadAvatar expects the raw File object and handles FormData internally
      const response = await userAPI.uploadAvatar(file);

      if (response.data.success) {
        toast.success('Avatar updated successfully');
        onSuccess?.(response.data.data.avatarUrl);
      }
    } catch (error) {
      console.error("Upload error", error);
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
      // Revert preview on error
      setPreview(currentAvatar);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative group cursor-pointer inline-block" onClick={() => !isLoading && fileInputRef.current?.click()}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isLoading}
        className="hidden"
      />

      <Avatar className={`${className} border-2 border-muted transition-opacity group-hover:opacity-90`}>
        <AvatarImage src={preview || currentAvatar} className="object-cover" />
        <AvatarFallback className="text-2xl bg-muted">
          {fallback || 'U'}
        </AvatarFallback>
      </Avatar>

      {/* Hover Overlay */}
      <div className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isLoading ? 'opacity-100' : ''}`}>
        {isLoading ? (
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        ) : (
          <Camera className="h-6 w-6 text-white drop-shadow-md" />
        )}
      </div>

      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md border-2 border-background group-hover:scale-110 transition-transform">
        <Upload className="h-3 w-3" />
      </div>
    </div>
  );
}
