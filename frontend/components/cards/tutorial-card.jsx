'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, BarChart2, PlayCircle, FileText, BookOpen, Loader2, CheckCircle2 } from 'lucide-react';
import SmartImage from '@/components/ui/smart-image';
import StarRating from '@/components/star-rating';
import { useAuthStore } from '@/store/auth-store';
import { tutorialAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TutorialCard({ tutorial, index = 0 }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isEnrolled, setIsEnrolled] = useState(tutorial.isEnrolled || false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const typeIcons = {
    course: BookOpen,
    free: PlayCircle,
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to enroll');
      router.push('/auth/login');
      return;
    }

    setEnrollLoading(true);
    try {
      const response = await tutorialAPI.enroll(tutorial._id);
      const newlyEnrolled = response.data?.data?.isEnrolled;
      setIsEnrolled(newlyEnrolled);
      toast.success(newlyEnrolled ? 'Enrolled Course!' : 'Unenrolled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update enrollment');
    } finally {
      setEnrollLoading(false);
    }
  };

  const TypeIcon = typeIcons[tutorial.type] || BookOpen;

  const creator =
    tutorial?.creatorId && typeof tutorial.creatorId === 'object' ? tutorial.creatorId : null;
  const creatorAvatarUrl = creator?.avatarUrl || null;
  const creatorDisplayName =
    creator?.creatorProfile?.displayName || creator?.name || 'Creator';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/tutorial/${tutorial._id}`}>
        <Card className="group overflow-hidden h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-none shadow-sm bg-white">
          <div className="relative aspect-square w-full">
            <div className="absolute inset-0 overflow-hidden bg-muted">
              <SmartImage
                src={tutorial.thumbnailUrl}
                alt={tutorial.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {creator && (
              <div className="absolute left-4 -bottom-6 z-10">
                <Avatar className="h-12 w-12 border-4 border-white bg-white shadow-sm">
                  {creatorAvatarUrl ? (
                    <AvatarImage src={creatorAvatarUrl} alt={creatorDisplayName} />
                  ) : null}
                  <AvatarFallback>{creatorDisplayName?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-white/90 backdrop-blur-sm text-primary border-none hover:bg-white flex items-center gap-1 shadow-sm">
                <TypeIcon className="h-3 w-3" />
                <span className="capitalize">{tutorial.type || 'Course'}</span>
              </Badge>
            </div>
          </div>
          <CardContent className="p-5">
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1 mb-2">
              {tutorial.title}
            </h3>

            <div className="flex flex-wrap gap-1 mb-3">
              {tutorial.tags?.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">#{tag}</span>
              ))}
            </div>

            <div className="flex items-center justify-between mt-auto mb-6">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <StarRating rating={tutorial.averageRating || 0} size="sm" />
                <span>{tutorial.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>

            <Button
              className={`w-full h-10 rounded-xl font-bold transition-all duration-300 ${isEnrolled ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
              variant={isEnrolled ? "default" : "secondary"}
              onClick={handleEnroll}
              disabled={enrollLoading}
            >
              {enrollLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isEnrolled ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : null}
              {isEnrolled ? 'Enrolled Course' : 'Enroll Course'}
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
