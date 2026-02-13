'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { tutorialAPI } from '@/lib/api-client';
import { toast } from 'sonner';
import { Loader2, Camera, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

export default function TutorialThumbnailUpload({ thumbnailUrl, setThumbnailUrl }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await tutorialAPI.uploadThumbnail(formData);

            setThumbnailUrl(response.data.url);
            toast.success('Thumbnail uploaded successfully');

        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload thumbnail');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeThumbnail = () => {
        setThumbnailUrl('');
    };

    return (
        <div className="space-y-4">
            {thumbnailUrl ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-muted group max-w-md mx-auto">
                    <Image
                        src={getImageUrl(thumbnailUrl)}
                        alt="Course Thumbnail"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Change
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={removeThumbnail}
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full aspect-video max-w-md mx-auto rounded-3xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-4 group"
                >
                    {uploading ? (
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    ) : (
                        <>
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Camera className="h-8 w-8 text-primary" />
                            </div>
                            <div className="text-center">
                                <span className="text-base font-bold text-slate-700 block">Upload Thumbnail</span>
                                <span className="text-xs text-muted-foreground">High-quality images (16:9) work best</span>
                            </div>
                        </>
                    )}
                </button>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />
        </div>
    );
}
