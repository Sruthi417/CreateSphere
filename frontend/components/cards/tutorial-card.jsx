'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BarChart2, PlayCircle, FileText, BookOpen } from 'lucide-react';
import SmartImage from '@/components/ui/smart-image';
import StarRating from '@/components/star-rating';

export default function TutorialCard({ tutorial, index = 0 }) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const typeIcons = {
    course: BookOpen,
    free: PlayCircle,
  };

  const TypeIcon = typeIcons[tutorial.type] || BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/tutorial/${tutorial._id}`}>
        <Card className="group overflow-hidden h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-none shadow-sm bg-white">
          <div className="relative aspect-video overflow-hidden bg-muted">
            <SmartImage
              src={tutorial.thumbnailUrl}
              alt={tutorial.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
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

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`${difficultyColors[tutorial.difficulty] || ''} text-[10px] font-bold uppercase px-2 py-0 h-5`}
                >
                  {tutorial.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <StarRating rating={tutorial.averageRating || 0} size="sm" />
                <span>{tutorial.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
