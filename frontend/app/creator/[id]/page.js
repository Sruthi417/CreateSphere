'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ProductCard from '@/components/cards/product-card';
import TutorialCard from '@/components/cards/tutorial-card';
import StarRating from '@/components/star-rating';
import { creatorAPI, productAPI, tutorialAPI, userAPI, chatAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';
import {
  Star,
  Users,
  Package,
  BookOpen,
  MessageCircle,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export default function CreatorProfilePage({ params }) {
  const creatorId = params.id;


  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [creator, setCreator] = useState(null);
  const [products, setProducts] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    fetchCreator();
    fetchCreatorContent();
  }, [creatorId]);

  const fetchCreator = async () => {
    try {
      const response = await creatorAPI.getById(creatorId);
      const creatorData = response.data.data;
      setCreator(creatorData);
      // Initialize following state from API response
      setFollowing(creatorData.isFollowing || false);
    } catch (error) {
      toast.error('Failed to load creator profile');
      router.push('/explore/creators');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorContent = async () => {
    try {
      const [productsRes, tutorialsRes] = await Promise.all([
        productAPI.getByCreator(creatorId).catch(() => ({ data: { data: [] } })),
        tutorialAPI.getByCreator(creatorId).catch(() => ({ data: { data: [] } })),
      ]);
      setProducts(productsRes.data.data || []);
      setTutorials(tutorialsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load creator content:', error);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow creators');
      return;
    }

    if (user?._id === creatorId) {
      toast.error("You can't follow yourself");
      return;
    }

    setFollowLoading(true);
    try {
      let response;
      if (following) {
        response = await userAPI.unfollowCreator(creatorId);
        toast.success('Unfollowed creator');
      } else {
        response = await userAPI.followCreator(creatorId);
        toast.success('Following creator');
      }

      // Update state from backend response (single source of truth)
      const { isFollowing, followersCount: newCount } = response.data.data;
      setFollowing(isFollowing);

      // Update creator data with backend values
      setCreator(prev => ({
        ...prev,
        isFollowing,
        creatorProfile: {
          ...prev.creatorProfile,
          followersCount: newCount
        }
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to send messages');
      router.push('/auth/login');
      return;
    }

    setMessageLoading(true);
    try {
      const response = await chatAPI.openConversation(creatorId);
      const conversationId = response.data.data._id;
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to open conversation');
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 mb-8">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!creator) return null;

  const profile = creator.creatorProfile || {};

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/explore/creators" className="text-muted-foreground hover:text-foreground text-sm flex items-center">
              <ChevronLeft className="h-4 w-4" />
              Back to Creators
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-start gap-6 mb-8"
            >
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage src={getImageUrl(creator.avatarUrl)} alt={profile.displayName} />
                <AvatarFallback className="text-3xl">
                  {profile.displayName?.charAt(0) || creator.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">
                    {profile.displayName || creator.name}
                  </h1>
                  {profile.verified && (
                    <CheckCircle2 className="h-6 w-6 text-primary fill-primary/20" />
                  )}
                </div>
                {profile.tagline && (
                  <p className="text-lg text-muted-foreground mb-4">{profile.tagline}</p>
                )}
                <div className="flex flex-wrap gap-6 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{profile.followersCount || 0}</span>
                    <span className="text-muted-foreground">Followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StarRating rating={profile.rating || 0} size="sm" />
                    <span className="font-semibold">{profile.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-muted-foreground">Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{products.length}</span>
                    <span className="text-muted-foreground">Products</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{tutorials.length}</span>
                    <span className="text-muted-foreground">Tutorials</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleFollow}
                    variant={following ? 'outline' : 'default'}
                    disabled={followLoading || user?._id === creatorId}
                  >
                    {followLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {following ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="outline" onClick={handleMessage} disabled={messageLoading || user?._id === creatorId}>
                    {messageLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageCircle className="h-4 w-4 mr-2" />}
                    Message
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            {profile.fullBio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">About</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{profile.fullBio}</p>
                    {profile.portfolio?.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-medium mb-2">Portfolio</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.portfolio.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-sm"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {new URL(url).hostname}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Content Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tabs defaultValue="products" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="products">
                    <Package className="h-4 w-4 mr-2" />
                    Products ({products.length})
                  </TabsTrigger>
                  <TabsTrigger value="tutorials">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Tutorials ({tutorials.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="products" className="mt-6">
                  {products.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No products yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product, index) => (
                        <ProductCard key={product._id} product={product} index={index} />
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="tutorials" className="mt-6">
                  {tutorials.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No tutorials yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tutorials.map((tutorial, index) => (
                        <TutorialCard key={tutorial._id} tutorial={tutorial} index={index} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
