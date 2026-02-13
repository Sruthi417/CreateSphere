'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import StarRating from '@/components/star-rating';
import ReportModal from '@/components/modals/report-modal';
import { tutorialAPI, reviewAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';
import {
  Clock,
  BookOpen,
  Flag,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Send,
  Edit2,
  Trash2,
  Play,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Circle,
  Hash
} from 'lucide-react';

export default function TutorialDetailPage() {
  const params = useParams();
  const tutorialId = params.id;
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [tutorial, setTutorial] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState([0]); // Default first lesson expanded

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

  const toggleLesson = (index) => {
    if (expandedLessons.includes(index)) {
      setExpandedLessons(expandedLessons.filter(i => i !== index));
    } else {
      setExpandedLessons([...expandedLessons, index]);
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tutorial) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="flex-1">
        {/* Course Hero Section */}
        <div className="bg-white border-b">
          <div className="container px-4 py-12">
            <Link href="/explore/tutorials" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center mb-8">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Catalog
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/20 px-3">
                    {tutorial.categoryId?.name || 'Skill Build'}
                  </Badge>
                  <StarRating rating={tutorial.averageRating || 0} />
                  <span className="text-xs font-medium text-muted-foreground">
                    ({tutorial.reviewsCount || 0} Learners)
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                  {tutorial.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {tutorial.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {tutorial.tags?.map((tag, i) => (
                    <Badge key={i} variant="outline" className="flex items-center gap-1 font-normal">
                      <Hash className="h-3 w-3" /> {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
                  <Link href={`/creator/${tutorial.creatorId?._id}`} className="group flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-primary/10 transition-transform group-hover:scale-105">
                      <AvatarImage src={getImageUrl(tutorial.creatorId?.avatarUrl)} />
                      <AvatarFallback>{tutorial.creatorId?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Lead Instructor</span>
                      <span className="font-bold group-hover:text-primary transition-colors flex items-center gap-1 text-sm">
                        {tutorial.creatorId?.creatorProfile?.displayName || tutorial.creatorId?.name}
                        {tutorial.creatorId?.creatorProfile?.verified && <CheckCircle2 className="h-3 w-3 text-primary" />}
                      </span>
                    </div>
                  </Link>
                  <div className="h-8 w-px bg-muted-foreground/20 hidden sm:block" />
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs text-muted-foreground">Difficulty</span>
                    <span className="font-bold text-sm capitalize">{tutorial.difficulty || 'All Levels'}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="aspect-video rounded-3xl overflow-hidden bg-slate-200 shadow-2xl shadow-primary/10 border-4 border-white">
                  {tutorial.thumbnailUrl ? (
                    <img src={getImageUrl(tutorial.thumbnailUrl)} alt={tutorial.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-20 w-20 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="h-20 w-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm">
                      <Play className="h-8 w-8 text-primary fill-primary ml-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Course Curriculum */}
        <div className="container px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                  <Layers className="h-8 w-8 text-primary" />
                  Curriculum
                </h2>

                <div className="space-y-4">
                  {tutorial.lessons?.map((lesson, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                      <button
                        onClick={() => toggleLesson(idx)}
                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all">
                            {idx + 1}
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-0.5">Lesson {idx + 1}</span>
                            <h3 className="font-bold text-lg">{lesson.title}</h3>
                          </div>
                        </div>
                        {expandedLessons.includes(idx) ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                      </button>

                      <AnimatePresence>
                        {expandedLessons.includes(idx) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <div className="px-6 pb-6 pt-2 border-t space-y-3">
                              {lesson.topics?.map((topic, tIdx) => (
                                <div key={tIdx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group border border-transparent hover:border-slate-100 transition-all">
                                  <div className="flex items-center gap-3">
                                    <Circle className="h-3 w-3 text-primary/40 group-hover:text-primary transition-colors fill-primary/10" />
                                    <span className="text-slate-700 font-medium">{topic.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-500">VIDEO READY</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="pt-12 border-t">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold">Learner Feedback</h2>
                </div>

                {isAuthenticated && (
                  <Card className="mb-10 rounded-3xl shadow-lg border-primary/10 overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 px-8 py-6">
                      <CardTitle className="text-xl">Your Thoughts</CardTitle>
                      <CardDescription>Share your experience with the community</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div>
                        <Label className="text-sm font-bold mb-3 block">Your Rating</Label>
                        <StarRating
                          rating={newReview.rating}
                          size="lg"
                          interactive
                          onChange={(rating) => setNewReview((r) => ({ ...r, rating }))}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-bold">Your Review</Label>
                        <Textarea
                          placeholder="What did you think of the curriculum and instructor?"
                          value={newReview.comment}
                          onChange={(e) => setNewReview((r) => ({ ...r, comment: e.target.value }))}
                          className="min-h-[120px] rounded-2xl resize-none text-base focus:ring-primary/20"
                          maxLength={1000}
                        />
                        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                          <span>{newReview.comment.length}/1000 characters</span>
                        </div>
                      </div>
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="w-full py-6 rounded-2xl text-lg font-bold shadow-xl shadow-primary/10"
                      >
                        {submittingReview ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                        {editingReview ? 'Update Feedback' : 'Submit Feedback'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
                      <Award className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-muted-foreground">Be the first to share your learning journey!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <Card key={review._id} className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12 ring-2 ring-slate-100">
                                <AvatarImage src={review.user?.avatarUrl} />
                                <AvatarFallback>{review.user?.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-slate-900">{review.user?.name || 'Academician'}</h4>
                                <div className="flex items-center gap-2">
                                  <StarRating rating={review.rating || 0} size="xs" />
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Review</span>
                                </div>
                              </div>
                            </div>
                            {user?._id === review.userId && (
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => { setEditingReview(review); setNewReview({ rating: review.rating, comment: review.comment || '' }); window.scrollTo({ top: 400, behavior: 'smooth' }); }}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={() => handleDeleteReview(review._id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          {review.comment && (
                            <p className="mt-4 text-slate-600 leading-relaxed text-sm italic pr-8">
                              &ldquo;{review.comment}&rdquo;
                            </p>
                          )}
                          <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="rounded-3xl border-none shadow-xl overflow-hidden bg-white">
                  <div className="p-8 space-y-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold">Professional Course</span>
                    </div>

                    <ul className="space-y-4">
                      {[
                        { icon: Layers, text: `${tutorial.lessons?.length || 0} Comprehensive Lessons` },
                        { icon: Award, text: 'Certificate of Completion' },
                        { icon: Clock, text: 'Self-paced learning structure' },
                        { icon: BookOpen, text: 'Lifetime access to curriculum' }
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-slate-600">
                          <item.icon className="h-4 w-4 text-primary" />
                          {item.text}
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full py-7 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20">
                      Enroll This Course
                    </Button>

                    <div className="flex justify-center">
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary" onClick={() => setReportOpen(true)}>
                        <Flag className="h-3 w-3 mr-1.5" />
                        Report this course
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-slate-900 text-white">
                  <div className="p-8">
                    <h4 className="font-bold mb-4">Instructor Quality</h4>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                      Our creators go through a rigorous verification process to ensure you get high-quality structured knowledge.
                    </p>
                    <div className="flex -space-x-3 overflow-hidden">
                      {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {idx === 4 ? '+5K' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
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
