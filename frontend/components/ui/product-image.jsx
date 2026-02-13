'use client';

import { useState, useEffect } from 'react';
import { getImageUrl, cn } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';

export default function ProductImage({ src, alt, className, fill, ...props }) {
    const [error, setError] = useState(false);
    const [imgSrc, setImgSrc] = useState('');

    useEffect(() => {
        setImgSrc(getImageUrl(src));
        setError(false);
    }, [src]);

    if (!imgSrc || error) {
        return (
            <div className={cn("flex items-center justify-center bg-muted text-muted-foreground w-full h-full", className)}>
                <ImageIcon className="h-10 w-10 opacity-50" />
            </div>
        );
    }

    return (
        <img
            src={imgSrc}
            alt={alt || "Product image"}
            className={cn("object-cover", className, fill ? "w-full h-full" : "")}
            onError={() => setError(true)}
            {...props}
        />
    );
}
