'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { creatorAPI, categoryAPI } from '@/lib/api-client';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Palette, ArrowRight, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, user, onboardingStatus, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    displayName: '',
    tagline: '',
    fullBio: '',
    portfolio: '',
    categories: [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchCategories();
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.list();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleStartOnboarding = async () => {
    setLoading(true);
    try {
      await creatorAPI.startOnboarding();
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (!formData.displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    if (formData.fullBio.length < 20) {
      toast.error('Bio must be at least 20 characters');
      return;
    }
    if (formData.categories.length === 0) {
      toast.error('Select at least one category');
      return;
    }

    setLoading(true);
    try {
      const portfolioUrls = formData.portfolio
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url);

      const response = await creatorAPI.completeSetup({
        displayName: formData.displayName,
        tagline: formData.tagline,
        fullBio: formData.fullBio,
        portfolio: portfolioUrls,
        categories: formData.categories,
      });

      // Update user state
      setUser({
        ...user,
        role: 'creator',
        onboardingStatus: 'creator_completed',
        creatorProfile: response.data.data,
      });

      toast.success('Creator profile created!');
      router.push('/creator/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <Navbar />
      <main className="container px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Become a Creator</CardTitle>
                  <CardDescription>
                    Share your craft with the world and connect with customers who love handmade creations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Showcase Your Products</p>
                        <p className="text-sm text-muted-foreground">
                          Create a beautiful portfolio of your handmade items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Share Tutorials</p>
                        <p className="text-sm text-muted-foreground">
                          Teach others your craft through step-by-step guides
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Build Your Community</p>
                        <p className="text-sm text-muted-foreground">
                          Connect with followers and grow your creative business
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Get Verified</p>
                        <p className="text-sm text-muted-foreground">
                          Earn a verification badge to stand out as a trusted creator
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleStartOnboarding}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Profile Setup */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Set Up Your Creator Profile</CardTitle>
                  <CardDescription>
                    Tell us about yourself and your craft
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      placeholder="e.g., Sarah's Crafts"
                      value={formData.displayName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline (optional)</Label>
                    <Input
                      id="tagline"
                      placeholder="e.g., Handmade jewelry with love"
                      maxLength={100}
                      value={formData.tagline}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullBio">Bio * (min 20 characters)</Label>
                    <Textarea
                      id="fullBio"
                      placeholder="Tell us about yourself, your craft, and what makes your creations special..."
                      rows={5}
                      value={formData.fullBio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullBio: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.fullBio.length} characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Categories * (select at least one)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {categories.map((category) => (
                        <div
                          key={category._id}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            formData.categories.includes(category._id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => handleCategoryToggle(category._id)}
                        >
                          <Checkbox
                            checked={formData.categories.includes(category._id)}
                            onCheckedChange={() => handleCategoryToggle(category._id)}
                          />
                          <span className="text-sm">{category.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio Links (optional)</Label>
                    <Textarea
                      id="portfolio"
                      placeholder="Enter portfolio URLs, one per line"
                      rows={3}
                      value={formData.portfolio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, portfolio: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add links to your website, social media, or other portfolios
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleCompleteSetup} disabled={loading} className="flex-1">
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Complete Setup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
