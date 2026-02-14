'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { creatorAPI, productAPI, tutorialAPI } from '@/lib/api-client';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ConfirmDialog from '@/components/modals/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Package,
  BookOpen,
  Users,
  Star,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  BadgeCheck,
  Shield,
} from 'lucide-react';
import ProductImage from '@/components/ui/product-image';

export default function CreatorDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, userRole, creatorProfile, setCreatorProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '' });
  const [actionLoading, setActionLoading] = useState('');
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [profileRes, productsRes, tutorialsRes, eligibilityRes] = await Promise.all([
        creatorAPI.getMyProfile(),
        productAPI.getMyList().catch(() => ({ data: { data: [] } })),
        tutorialAPI.getMyList().catch(() => ({ data: { data: [] } })),
        creatorAPI.checkVerificationEligibility().catch(() => ({ data: { data: null } })),
      ]);
      setProfile(profileRes.data.data);
      setEligibility(eligibilityRes.data.data);
      setCreatorProfile(profileRes.data.data?.creatorProfile);
      setProducts(productsRes.data.data || []);
      setTutorials(tutorialsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      if (error.response?.status === 403) {
        router.push('/creator/onboarding');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    setActionLoading('delete');
    try {
      await productAPI.delete(deleteDialog.id);
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setActionLoading('');
      setDeleteDialog({ open: false, type: '', id: '' });
    }
  };

  const handleDeleteTutorial = async () => {
    setActionLoading('delete');
    try {
      await tutorialAPI.delete(deleteDialog.id);
      toast.success('Tutorial deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete tutorial');
    } finally {
      setActionLoading('');
      setDeleteDialog({ open: false, type: '', id: '' });
    }
  };

  const handleRestoreProduct = async (productId) => {
    setActionLoading(productId);
    try {
      await productAPI.restore(productId);
      toast.success('Product restored');
      fetchData();
    } catch (error) {
      toast.error('Failed to restore product');
    } finally {
      setActionLoading('');
    }
  };

  const handleRestoreTutorial = async (tutorialId) => {
    setActionLoading(tutorialId);
    try {
      await tutorialAPI.restore(tutorialId);
      toast.success('Tutorial restored');
      fetchData();
    } catch (error) {
      toast.error('Failed to restore tutorial');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeactivate = async () => {
    setActionLoading('deactivate');
    try {
      await creatorAPI.deactivate();
      toast.success('Creator mode deactivated');
      fetchData();
    } catch (error) {
      toast.error('Failed to deactivate');
    } finally {
      setActionLoading('');
    }
  };

  const handleReactivate = async () => {
    setActionLoading('reactivate');
    try {
      await creatorAPI.reactivate();
      toast.success('Creator mode reactivated');
      fetchData();
    } catch (error) {
      toast.error('Failed to reactivate');
    } finally {
      setActionLoading('');
    }
  };

  const handleApplyVerification = async () => {
    setActionLoading('apply-verification');
    try {
      await creatorAPI.applyForVerification();
      toast.success('Verification request submitted!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </main>
        <Footer />
      </div>
    );
  }

  const cp = profile?.creatorProfile || creatorProfile || {};
  const hiddenProducts = products.filter(p => p.status === 'hidden' || p.isBlocked);
  const hiddenTutorials = tutorials.filter(t => t.status === 'hidden' || t.isBlocked);
  const hasContentRestriction = hiddenProducts.length > 0 || hiddenTutorials.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-8">
          {/* Moderation Banner */}
          {profile?.isBlocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6"
            >
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
                <div className="bg-rose-100 p-2 rounded-xl">
                  <Shield className="h-6 w-6 text-rose-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-rose-900 font-bold text-lg mb-1">Creator Account Restricted</h3>
                  <p className="text-rose-700 text-sm">
                    Your creator profile and all content have been hidden from the public marketplace by an admin.
                    {profile.moderation?.lastReason && (
                      <span className="block mt-2 font-medium bg-rose-100/50 p-3 rounded-lg border border-rose-200/50">Reason: {profile.moderation.lastReason}</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!profile?.isBlocked && hasContentRestriction && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-amber-900 font-bold text-lg mb-1">Content Under Review</h3>
                  <p className="text-amber-700 text-sm">
                    Some of your items ({hiddenProducts.length} products, {hiddenTutorials.length} tutorials) have been hidden or blocked.
                    Please review them in the tabs below.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatarUrl || user?.avatarUrl} />
                <AvatarFallback className="text-xl">
                  {cp.displayName?.charAt(0) || user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{cp.displayName || user?.name}</h1>
                  {cp.verified && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  {profile?.isBlocked && (
                    <Badge variant="destructive" className="bg-rose-500">BLOCKED</Badge>
                  )}
                  {cp.isDeactivated && (
                    <Badge variant="secondary" className="bg-slate-200 text-slate-700">Deactivated</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{cp.tagline || 'Creator Dashboard'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!profile?.isBlocked && (
                cp.isDeactivated ? (
                  <Button onClick={handleReactivate} disabled={actionLoading === 'reactivate'}>
                    {actionLoading === 'reactivate' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Reactivate
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={handleDeactivate} disabled={actionLoading === 'deactivate'}>
                    {actionLoading === 'deactivate' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Deactivate
                  </Button>
                )
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{cp.followersCount || 0}</span>
                </div>
                <p className="text-sm text-muted-foreground">Followers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">{cp.rating?.toFixed(1) || 'N/A'}</span>
                </div>
                <p className="text-sm text-muted-foreground">Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{products.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Products</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{tutorials.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Tutorials</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="products" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="products">
                    <Package className="h-4 w-4 mr-2" />
                    Products
                  </TabsTrigger>
                  <TabsTrigger value="tutorials">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Tutorials
                  </TabsTrigger>
                  <TabsTrigger value="verification">
                    <BadgeCheck className="h-4 w-4 mr-2" />
                    Verification
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="products">
                <div className="flex justify-end mb-4">
                  <Link href="/product/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Product
                    </Button>
                  </Link>
                </div>
                {products.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No products yet</p>
                      <Link href="/product/create">
                        <Button>Create Your First Product</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <Card key={product._id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <ProductImage
                                src={product.images?.[0]}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">{product.title}</h3>
                                <div className="flex gap-2">
                                  {product.status === 'removed' ? (
                                    <Badge variant="destructive" className="bg-rose-600 font-bold">BANNED</Badge>
                                  ) : product.status === 'hidden' ? (
                                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 font-bold">HIDDEN</Badge>
                                  ) : product.isBlocked ? (
                                    <Badge variant="destructive" className="bg-rose-500 font-bold">BLOCKED</Badge>
                                  ) : (
                                    <Badge variant="default" className="bg-emerald-500 font-bold">ACTIVE</Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {product.shortDescription || product.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {product.averageRating?.toFixed(1) || 'N/A'}
                                </span>
                                <span>{product.reviewsCount || 0} reviews</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/product/${product._id}`}>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/product/${product._id}/edit`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              {product.status === 'deleted' ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRestoreProduct(product._id)}
                                  disabled={actionLoading === product._id}
                                >
                                  {actionLoading === product._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-4 w-4" />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteDialog({ open: true, type: 'product', id: product._id })}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tutorials">
                <div className="flex justify-end mb-4">
                  <Link href="/tutorial/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Tutorial
                    </Button>
                  </Link>
                </div>
                {tutorials.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No tutorials yet</p>
                      <Link href="/tutorial/create">
                        <Button>Create Your First Tutorial</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {tutorials.map((tutorial) => (
                      <Card key={tutorial._id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <div className="flex items-center justify-center h-full">
                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">{tutorial.title}</h3>
                                <div className="flex gap-2">
                                  {tutorial.status === 'removed' ? (
                                    <Badge variant="destructive" className="bg-rose-600 font-bold">BANNED</Badge>
                                  ) : tutorial.status === 'hidden' ? (
                                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 font-bold">HIDDEN</Badge>
                                  ) : tutorial.isBlocked ? (
                                    <Badge variant="destructive" className="bg-rose-500 font-bold">BLOCKED</Badge>
                                  ) : (
                                    <Badge variant="default" className="bg-emerald-500 font-bold">ACTIVE</Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {tutorial.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <Badge variant="outline">{tutorial.difficulty}</Badge>
                                <Badge variant="outline">{tutorial.type}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/tutorial/${tutorial._id}`}>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/tutorial/${tutorial._id}/edit`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              {tutorial.status === 'deleted' ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRestoreTutorial(tutorial._id)}
                                  disabled={actionLoading === tutorial._id}
                                >
                                  {actionLoading === tutorial._id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-4 w-4" />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteDialog({ open: true, type: 'tutorial', id: tutorial._id })}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="verification">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Verification Status
                    </CardTitle>
                    <CardDescription>
                      Get verified to build trust with your audience and unlock exclusive features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Status Banner */}
                    <div className={`p-4 rounded-lg border flex items-center justify-between ${cp.verified
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : cp.verificationStatus === 'requested'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : cp.verificationStatus === 'revoked'
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}>
                      <div className="flex items-center gap-3">
                        {cp.verified ? (
                          <BadgeCheck className="h-6 w-6" />
                        ) : cp.verificationStatus === 'requested' ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <Shield className="h-6 w-6" />
                        )}
                        <div>
                          <p className="font-bold">
                            {cp.verified
                              ? 'You are Verified!'
                              : cp.verificationStatus === 'requested'
                                ? 'Verification Pending'
                                : cp.verificationStatus === 'revoked'
                                  ? 'Verification Revoked'
                                  : 'Not Verified'}
                          </p>
                          <p className="text-sm opacity-90">
                            {cp.verified
                              ? 'Your profile carries the verification badge.'
                              : cp.verificationStatus === 'requested'
                                ? 'An admin is reviewing your profile.'
                                : cp.verificationStatus === 'revoked'
                                  ? 'An admin has removed your verification.'
                                  : 'Complete the requirements below to apply.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Requirements Section */}
                    {!cp.verified && cp.verificationStatus !== 'requested' && eligibility && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          Requirements for Verification
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Products Requirement */}
                          <div className="p-4 rounded-xl bg-white border shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-slate-600">Active Products</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${eligibility.currentProducts >= eligibility.minProducts ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {eligibility.currentProducts} / {eligibility.minProducts}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${eligibility.currentProducts >= eligibility.minProducts ? 'bg-green-500' : 'bg-primary'}`}
                                style={{ width: `${Math.min((eligibility.currentProducts / eligibility.minProducts) * 100, 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 italic">Upload at least 2 active products to the marketplace.</p>
                          </div>

                          {/* Reviews Requirement */}
                          <div className="p-4 rounded-xl bg-white border shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-slate-600">Total Reviews</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${eligibility.currentReviews >= eligibility.minReviews ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {eligibility.currentReviews} / {eligibility.minReviews}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${eligibility.currentReviews >= eligibility.minReviews ? 'bg-green-500' : 'bg-primary'}`}
                                style={{ width: `${Math.min((eligibility.currentReviews / eligibility.minReviews) * 100, 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 italic">Receive at least 3 reviews from your learners or customers.</p>
                          </div>
                        </div>

                        <div className="pt-4 flex justify-center">
                          <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-white px-8"
                            disabled={!eligibility.isEligible || actionLoading === 'apply-verification'}
                            onClick={handleApplyVerification}
                          >
                            {actionLoading === 'apply-verification' ? (
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                              <BadgeCheck className="h-5 w-5 mr-2" />
                            )}
                            {eligibility.isEligible ? 'Apply for Verification' : 'Criteria Not Met'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title={`Delete ${deleteDialog.type}?`}
        description="This will hide the content from the marketplace. You can restore it later."
        confirmText="Delete"
        variant="destructive"
        onConfirm={deleteDialog.type === 'product' ? handleDeleteProduct : handleDeleteTutorial}
      />
    </div>
  );
}
