'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Users, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { userAPI } from '@/lib/api-client';
import { toast } from 'sonner';

export default function CreatorCard({ creator, index = 0, isFollowing = false }) {
  const { isAuthenticated, user } = useAuthStore();
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const profile = creator.creatorProfile || {};

  const handleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to follow creators');
      return;
    }

    if (user?._id === creator._id) {
      toast.error("You can't follow yourself");
      return;
    }

    setLoading(true);
    try {
      if (following) {
        await userAPI.unfollowCreator(creator._id);
        toast.success('Unfollowed creator');
      } else {
        await userAPI.followCreator(creator._id);
        toast.success('Following creator');
      }
      setFollowing(!following);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update follow status');
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
      <Link href={`/creator/${creator._id}`}>
        <Card className="group overflow-hidden h-full hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarImage src={creator.avatarUrl} alt={profile.displayName} />
                <AvatarFallback className="text-xl">
                  {profile.displayName?.charAt(0) || creator.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {profile.displayName || creator.name}
                </h3>
                {profile.verified && (
                  <CheckCircle2 className="h-4 w-4 text-primary fill-primary/20" />
                )}
              </div>
              {profile.tagline && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {profile.tagline}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.followersCount || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{profile.rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
              <Button
                variant={following ? 'outline' : 'default'}
                size="sm"
                className="mt-4 w-full"
                onClick={handleFollow}
                disabled={loading}
              >
                {following ? 'Following' : 'Follow'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
