'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, ExternalLink } from 'lucide-react';
import StarRating from '@/components/star-rating';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { userAPI } from '@/lib/api-client';
import { toast } from 'sonner';
import ProductImage from '@/components/ui/product-image';

export default function ProductCard({ product, index = 0, isFavorited = false }) {
  const { isAuthenticated } = useAuthStore();
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }

    setLoading(true);
    try {
      if (favorited) {
        await userAPI.removeFavorite(product._id);
        toast.success('Removed from favorites');
      } else {
        await userAPI.addFavorite(product._id);
        toast.success('Added to favorites');
      }
      setFavorited(!favorited);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/product/${product._id}`}>
        <Card className="group overflow-hidden h-full hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            <ProductImage
              src={product.images?.[0]}
              alt={product.title}
              fill
              className="group-hover:scale-105 transition-transform duration-300"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={handleFavorite}
              disabled={loading}
            >
              <Heart className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            {product.isCustomizable && (
              <Badge className="absolute top-2 left-2 z-10" variant="secondary">
                Customizable
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.shortDescription || product.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={product.averageRating || 0} size="sm" />
                  <span className="text-xs font-semibold">
                    {typeof product.averageRating === 'number' ? product.averageRating.toFixed(1) : '0.0'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewsCount || 0} reviews)
                </span>
              </div>
              {product.estimatedPrice && (
                <span className="font-semibold text-primary">
                  ${product.estimatedPrice}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
