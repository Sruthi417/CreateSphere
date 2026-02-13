'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { productAPI } from '@/lib/api-client';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';

export default function ProductImageUpload({ images, setImages }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (images.length + files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        setUploading(true);
        try {
            const newImages = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);
                const response = await productAPI.uploadImage(formData);
                newImages.push(response.data.url);
            }

            setImages([...images, ...newImages]);
            toast.success('Images uploaded successfully');

        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload images');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                        <Image
                            src={getImageUrl(url)}
                            alt={`Product ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-destructive/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                {images.length < 5 && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 transition-colors"
                    >
                        {uploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground font-medium">Add Image</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
            />
            <p className="text-xs text-muted-foreground">
                Upload up to 5 images. Supported formats: JPG, PNG, WEBP.
            </p>
        </div>
    );
}
