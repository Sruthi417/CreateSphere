'use client';

import { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';

export default function SmartImage({ src, alt, className, fill, ...props }) {
    const [error, setError] = useState(false);
    const [imgSrc, setImgSrc] = useState('');

    useEffect(() => {
        if (src) {
            setImgSrc(getImageUrl(src));
            setError(false);
        }
    }, [src]);

    if (!src || !imgSrc || error) {
        return (
            <div className={cn("flex items-center justify-center bg-muted text-muted-foreground w-full h-full", className)}>
                <ImageIcon className="h-2/5 w-2/5 opacity-50" />
            </div>
        );
    }

    return (
        <img
            src={imgSrc}
            alt={alt || "Image"}
            className={cn("object-cover", className, fill ? "w-full h-full" : "")}
            onError={() => setError(true)}
            {...props}
        />
    );
}
