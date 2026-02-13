'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BarChart2, PlayCircle, FileText, BookOpen } from 'lucide-react';
import SmartImage from '@/components/ui/smart-image';

export default function TutorialCard({ tutorial, index = 0 }) {
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

  const TypeIcon = typeIcons[tutorial.type] || BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/tutorial/${tutorial._id}`}>
        <Card className="group overflow-hidden h-full hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="relative aspect-video overflow-hidden bg-muted">
            <SmartImage
              src={tutorial.thumbnailUrl || tutorial.images?.[0]}
              alt={tutorial.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <TypeIcon className="h-3 w-3" />
                {tutorial.type}
              </Badge>
            </div>
            {tutorial.duration && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {tutorial.duration}
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {tutorial.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {tutorial.description}
            </p>
            <div className="flex items-center justify-between mt-3">
              <Badge
                variant="outline"
                className={difficultyColors[tutorial.difficulty] || ''}
              >
                <BarChart2 className="h-3 w-3 mr-1" />
                {tutorial.difficulty}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
