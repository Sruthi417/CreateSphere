'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { tutorialAPI, categoryAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { BookOpen, Plus, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateTutorialPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState(['']);
  const [steps, setSteps] = useState(['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const tutorialType = watch('type');
  const categoryId = watch('categoryId');
  const difficulty = watch('difficulty');

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

  const addField = (setter, state) => {
    setter([...state, '']);
  };

  const removeField = (setter, state, index) => {
    if (state.length > 1) {
      setter(state.filter((_, i) => i !== index));
    }
  };

  const updateField = (setter, state, index, value) => {
    const newState = [...state];
    newState[index] = value;
    setter(newState);
  };

  const onSubmit = async (data) => {
    if (!data.type) {
      toast.error('Please select a tutorial type');
      return;
    }
    if (!data.categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!data.difficulty) {
      toast.error('Please select a difficulty level');
      return;
    }

    setLoading(true);
    try {
      await tutorialAPI.create({
        title: data.title,
        description: data.description,
        type: data.type,
        videoUrl: data.videoUrl,
        duration: data.duration,
        difficulty: data.difficulty,
        categoryId: data.categoryId,
        materials: materials.filter((m) => m.trim()),
        steps: steps.filter((s) => s.trim()),
      });
      toast.success('Tutorial created successfully!');
      router.push('/creator/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create tutorial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Link href="/creator/dashboard" className="text-muted-foreground hover:text-foreground text-sm flex items-center mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Create New Tutorial
                  </CardTitle>
                  <CardDescription>
                    Share your knowledge and teach others your craft
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., How to Make a Wooden Bowl"
                        {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Min 3 characters' } })}
                      />
                      {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="What will learners achieve from this tutorial?"
                        rows={5}
                        {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Min 20 characters' } })}
                      />
                      {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type *</Label>
                        <Select onValueChange={(value) => setValue('type', value)} value={tutorialType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="guide">Guide</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Difficulty *</Label>
                        <Select onValueChange={(value) => setValue('difficulty', value)} value={difficulty}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select onValueChange={(value) => setValue('categoryId', value)} value={categoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {tutorialType === 'video' && (
                      <div className="space-y-2">
                        <Label htmlFor="videoUrl">Video URL</Label>
                        <Input
                          id="videoUrl"
                          placeholder="https://youtube.com/watch?v=..."
                          {...register('videoUrl')}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 30 minutes, 2 hours"
                        {...register('duration')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Materials Needed</Label>
                      {materials.map((material, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="e.g., Woodworking knife"
                            value={material}
                            onChange={(e) => updateField(setMaterials, materials, index, e.target.value)}
                          />
                          {materials.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeField(setMaterials, materials, index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => addField(setMaterials, materials)}>
                        <Plus className="h-4 w-4 mr-1" /> Add Material
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Steps</Label>
                      {steps.map((step, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="flex items-center justify-center w-8 h-10 text-sm font-medium text-muted-foreground">
                            {index + 1}.
                          </div>
                          <Input
                            placeholder="Describe this step"
                            value={step}
                            onChange={(e) => updateField(setSteps, steps, index, e.target.value)}
                          />
                          {steps.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeField(setSteps, steps, index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => addField(setSteps, steps)}>
                        <Plus className="h-4 w-4 mr-1" /> Add Step
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Tutorial
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
