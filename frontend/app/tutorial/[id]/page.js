'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import StarRating from '@/components/star-rating';
import ReportModal from '@/components/modals/report-modal';
import { tutorialAPI, reviewAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Clock,
  BarChart2,
  PlayCircle,
  FileText,
  BookOpen,
  Flag,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Send,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export default function TutorialDetailPage({ params }) {
  const resolvedParams = use(params);
  const tutorialId = resolvedParams.id;
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [tutorial, setTutorial] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const typeIcons = {
    video: PlayCircle,
    article: FileText,
    guide: BookOpen,
  };

  useEffect(() => {
    fetchTutorial();
    fetchReviews();
  }, [tutorialId]);

  const fetchTutorial = async () => {
    try {
      const response = await tutorialAPI.getById(tutorialId);
      setTutorial(response.data.data);
    } catch (error) {
      toast.error('Failed to load tutorial');
      router.push('/explore/tutorials');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getForTarget('tutorial', tutorialId);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
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
          targetId: tutorialId,
          targetType: 'tutorial',
          rating: newReview.rating,
          comment: newReview.comment,
        });
        toast.success('Review submitted');
      }
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
      fetchTutorial();
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
      fetchTutorial();
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
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="aspect-video w-full rounded-lg mb-6" />
          <Skeleton className="h-32 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!tutorial) return null;

  const TypeIcon = typeIcons[tutorial.type] || BookOpen;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/explore/tutorials" className="text-muted-foreground hover:text-foreground text-sm flex items-center">
              <ChevronLeft className="h-4 w-4" />
              Back to Tutorials
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TypeIcon className="h-3 w-3" />
                  {tutorial.type}
                </Badge>
                <Badge className={difficultyColors[tutorial.difficulty] || ''}>
                  <BarChart2 className="h-3 w-3 mr-1" />
                  {tutorial.difficulty}
                </Badge>
                {tutorial.duration && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {tutorial.duration}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{tutorial.title}</h1>
              <div className="flex items-center gap-4">
                <StarRating rating={tutorial.averageRating || 0} />
                <span className="text-sm text-muted-foreground">
                  {typeof tutorial.averageRating === 'number' ? tutorial.averageRating.toFixed(1) : '0.0'} ({tutorial.reviewsCount || 0} {tutorial.reviewsCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </motion.div>

            {/* Video/Content */}
            {tutorial.videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={tutorial.videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </motion.div>
            )}

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold mb-4">About this Tutorial</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{tutorial.description}</p>
            </motion.div>

            {/* Materials & Steps */}
            {(tutorial.materials?.length > 0 || tutorial.steps?.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid md:grid-cols-2 gap-6 mb-8"
              >
                {tutorial.materials?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Materials Needed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {tutorial.materials.map((material, i) => (
                          <li key={i}>{material}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                {tutorial.steps?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        {tutorial.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex justify-end mb-8">
              <Button variant="outline" onClick={() => setReportOpen(true)}>
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>

            {/* Creator Card */}
            {tutorial.creatorId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <Card>
                  <CardContent className="p-4">
                    <Link href={`/creator/${typeof tutorial.creatorId === 'object' ? tutorial.creatorId._id : tutorial.creatorId}`}>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={tutorial.creatorId?.avatarUrl} />
                          <AvatarFallback>
                            {tutorial.creatorId?.name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">
                              {tutorial.creatorId?.creatorProfile?.displayName || tutorial.creatorId?.name || 'Creator'}
                            </span>
                            {tutorial.creatorId?.creatorProfile?.verified && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {tutorial.creatorId?.creatorProfile?.tagline || 'Creator'}
                          </p>
                        </div>
                        <Button size="sm">View Profile</Button>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}

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
        </div>
      </main>
      <Footer />

      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetId={tutorialId}
        targetType="tutorial"
      />
    </div>
  );
}
