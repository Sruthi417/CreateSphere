'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import StarRating from '@/components/star-rating';
import ReportModal from '@/components/modals/report-modal';
import { productAPI, reviewAPI, userAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Heart,
  Star,
  MessageCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Users,
  Package,
  Loader2,
  Send,
  Edit2,
  Trash2,
} from 'lucide-react';
import ProductImage from '@/components/ui/product-image';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;

  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  console.log(product);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(productId);
      setProduct(response.data.data);
    } catch (error) {
      toast.error('Failed to load product');
      router.push('/explore/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getForTarget('product', productId);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }
    try {
      if (favorited) {
        await userAPI.removeFavorite(productId);
        toast.success('Removed from favorites');
      } else {
        await userAPI.addFavorite(productId);
        toast.success('Added to favorites');
      }
      setFavorited(!favorited);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update favorites');
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to leave a review');
      return;
    }
    if (!newReview.rating) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingReview(true);
    try {
      if (editingReview) {
        await reviewAPI.update(editingReview._id, {
          rating: newReview.rating,
          comment: newReview.comment,
        });
        toast.success('Review updated');
        setEditingReview(null);
      } else {
        await reviewAPI.create({
          targetId: productId,
          targetType: 'product',
          rating: newReview.rating,
          comment: newReview.comment,
        });
        toast.success('Review submitted');
      }
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
      fetchProduct(); // Refresh to get updated rating
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewAPI.delete(reviewId);
      toast.success('Review deleted');
      fetchReviews();
      fetchProduct();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setNewReview({ rating: review.rating, comment: review.comment || '' });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/explore/products" className="text-muted-foreground hover:text-foreground text-sm flex items-center">
              <ChevronLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <ProductImage
                  src={product.images?.[currentImageIndex]}
                  alt={product.title}
                  fill
                  className="object-cover w-full h-full"
                />
                {product.images?.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={() => setCurrentImageIndex((i) => (i === 0 ? product.images.length - 1 : i - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setCurrentImageIndex((i) => (i === product.images.length - 1 ? 0 : i + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${index === currentImageIndex ? 'border-primary' : 'border-transparent'
                        }`}
                    >
                      <ProductImage src={img} alt="" fill />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.isCustomizable && (
                    <Badge variant="secondary">Customizable</Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <StarRating rating={product.averageRating || 0} />
                    <span className="text-sm text-muted-foreground">
                      {typeof product.averageRating === 'number' ? product.averageRating.toFixed(1) : '0.0'} ({product.reviewsCount || 0} {product.reviewsCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  {product.estimatedPrice && (
                    <span className="text-2xl font-bold text-primary">
                      ${product.estimatedPrice}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground">{product.description}</p>

              {product.metadata && (
                <div className="space-y-2">
                  {product.metadata.materialsUsed?.length > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Materials:</span>{' '}
                      {product.metadata.materialsUsed.join(', ')}
                    </p>
                  )}
                  {product.metadata.estimatedCreationTime && (
                    <p className="text-sm">
                      <span className="font-medium">Creation Time:</span>{' '}
                      {product.metadata.estimatedCreationTime}
                    </p>
                  )}
                  {product.metadata.difficulty && (
                    <p className="text-sm">
                      <span className="font-medium">Difficulty:</span>{' '}
                      <Badge variant="outline">{product.metadata.difficulty}</Badge>
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleFavorite} variant={favorited ? 'default' : 'outline'} className="flex-1">
                  <Heart className={`h-4 w-4 mr-2 ${favorited ? 'fill-current' : ''}`} />
                  {favorited ? 'Favorited' : 'Add to Favorites'}
                </Button>
                <Button variant="outline" onClick={() => setReportOpen(true)}>
                  <Flag className="h-4 w-4" />
                </Button>
              </div>

              {/* Creator Card */}
              {product.creatorId && (
                <Card>
                  <CardContent className="p-4">
                    <Link href={`/creator/${typeof product.creatorId === 'object' ? product.creatorId._id : product.creatorId}`}>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={product.creatorId?.avatarUrl} />
                          <AvatarFallback>
                            {product.creatorId?.name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">
                              {product.creatorId?.creatorProfile?.displayName || product.creatorId?.name || 'Creator'}
                            </span>
                            {product.creatorId?.creatorProfile?.verified && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {product.creatorId?.creatorProfile?.tagline || 'Creator'}
                          </p>
                        </div>
                        <Button size="sm">View Profile</Button>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Reviews Section */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>

            {/* Leave Review */}
            {isAuthenticated && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingReview ? 'Edit Your Review' : 'Leave a Review'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                    <StarRating
                      rating={newReview.rating}
                      size="lg"
                      interactive
                      onChange={(rating) => setNewReview((r) => ({ ...r, rating }))}
                    />
                  </div>
                  <Textarea
                    placeholder="Share your experience..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview((r) => ({ ...r, comment: e.target.value }))}
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {newReview.comment.length}/1000
                    </span>
                    <div className="flex gap-2">
                      {editingReview && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingReview(null);
                            setNewReview({ rating: 5, comment: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button onClick={handleSubmitReview} disabled={submittingReview}>
                        {submittingReview && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Send className="h-4 w-4 mr-2" />
                        {editingReview ? 'Update' : 'Submit'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={review.user?.avatarUrl} />
                            <AvatarFallback>{review.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                            <StarRating rating={review.rating || 0} size="sm" />
                          </div>
                        </div>
                        {user?._id === review.userId && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditReview(review)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteReview(review._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-muted-foreground">{review.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetId={productId}
        targetType="product"
      />
    </div>
  );
}
