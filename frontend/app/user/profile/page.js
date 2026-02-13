'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { profileSchema } from '@/schemas/auth';
import { userAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AvatarUpload from '@/components/avatar-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { User, Mail, Calendar, Loader2, Save } from 'lucide-react';

export default function UserProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  console.log(profile);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      const data = response.data.data;
      setProfile(data);
      setUser(data);
      reset({
        name: data.name || '',
        avatarUrl: data.avatarUrl || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Send the full data to the update profile endpoint
      const response = await userAPI.updateProfile(data);

      const updatedUser = response.data.data;
      setUser({ ...user, ...updatedUser });
      setProfile(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUploadSuccess = (newAvatarUrl) => {
    // Update profile with new avatar URL
    const updatedProfile = { ...profile, avatarUrl: newAvatarUrl };
    setProfile(updatedProfile);
    setUser({ ...user, avatarUrl: newAvatarUrl });
    setValue('avatarUrl', newAvatarUrl, { shouldDirty: true });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-10 w-48 mb-8" />
            <Skeleton className="h-64" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold mb-8">My Profile</h1>

              {/* Profile Overview */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <AvatarUpload
                      currentAvatar={profile?.avatarUrl}
                      fallback={profile?.name?.charAt(0)}
                      onSuccess={handleAvatarUploadSuccess}
                      className="h-24 w-24"
                    />
                    <div>
                      <h2 className="text-2xl font-semibold">{profile?.name}</h2>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {profile?.email}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(profile?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit, (err) => console.log('Validation errors:', err))} className="space-y-6">
                    <div className="space-y-2">
                      {/* Profile picture is updated by clicking the avatar above */}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    {/* URL Input removed in favor of direct upload - keeping hidden field for form state */}
                    <input type="hidden" {...register('avatarUrl')} />

                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
