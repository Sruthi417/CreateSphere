'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
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
import { BookOpen, Plus, X, Loader2, ArrowLeft, GripVertical, ListOrdered, Hash, Image as ImageIcon, Camera } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import TutorialThumbnailUpload from '@/components/tutorial-thumbnail-upload.jsx';

export default function CreateTutorialPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      type: 'course',
      lessons: [{ title: '', topics: [{ title: '' }] }]
    }
  });

  const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
    control,
    name: 'lessons'
  });

  const categoryId = watch('categoryId');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchCategories();
  }, [isAuthenticated, router]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.list();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const onSubmit = async (data) => {
    if (!data.categoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!thumbnailUrl) {
      toast.error('Please upload a course thumbnail');
      return;
    }

    setLoading(true);
    try {
      await tutorialAPI.create({
        ...data,
        tags,
        thumbnailUrl
      });
      toast.success('Course published successfully!');
      router.push('/creator/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/creator/dashboard" className="text-muted-foreground hover:text-foreground text-sm flex items-center mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>

            <div className="mb-10">
              <h1 className="text-4xl font-bold tracking-tight mb-2">Publish a Course</h1>
              <p className="text-muted-foreground text-lg">Create a structured learning journey for your audience.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Course Info */}
              <Card className="border-none shadow-sm overflow-hidden">
                <div className="h-2 bg-primary w-full" />
                <CardHeader>
                  <CardTitle className="text-2xl">Course Details</CardTitle>
                  <CardDescription>The basic information about your learning program.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="title" className="text-base">Course Title *</Label>
                      <Input
                        id="title"
                        className="text-lg py-6"
                        placeholder="e.g., Master the Art of Pottery Sculpting"
                        {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } })}
                      />
                      {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description" className="text-base">Course Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide a detailed overview of what students will learn, who this is for, and what to expect."
                        className="min-h-[150px] text-base"
                        {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Min 20 characters' } })}
                      />
                      {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <Label htmlFor="thumbnailUrl" className="text-base flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> Course Thumbnail *
                      </Label>
                      <TutorialThumbnailUpload thumbnailUrl={thumbnailUrl} setThumbnailUrl={setThumbnailUrl} />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base">Category *</Label>
                      <Select onValueChange={(value) => setValue('categoryId', value)} value={categoryId}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Which field does this belong to?" />
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

                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-base flex items-center gap-2">
                        <Hash className="h-4 w-4" /> Tags
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <AnimatePresence>
                          {tags.map((tag) => (
                            <motion.div
                              key={tag}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <Badge variant="secondary" className="px-3 py-1 gap-1">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)}>
                                  <X className="h-3 w-3 hover:text-destructive" />
                                </button>
                              </Badge>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      <Input
                        placeholder="Type and press Enter to add tags (e.g., pottery, sculpting, beginner)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Curriculum */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ListOrdered className="h-6 w-6 text-primary" />
                    Curriculum Structure
                  </h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendLesson({ title: '', topics: [{ title: '' }] })}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Lesson
                  </Button>
                </div>

                <div className="space-y-6">
                  {lessonFields.map((lesson, lessonIndex) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group relative"
                    >
                      <Card className="border-l-4 border-l-primary/40 group-hover:border-l-primary transition-all shadow-sm">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-2">
                              <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">
                                Lesson {lessonIndex + 1}
                              </Label>
                              <Input
                                placeholder="e.g., Introduction and Safety"
                                className="font-semibold text-lg border-none hover:bg-muted/50 focus:bg-white transition-colors px-1"
                                {...register(`lessons.${lessonIndex}.title`, { required: true })}
                              />
                            </div>
                            {lessonFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLesson(lessonIndex)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="ml-8 space-y-3">
                            <Label className="text-xs font-medium text-muted-foreground">Topics in this lesson</Label>

                            <TopicsList lessonIndex={lessonIndex} control={control} register={register} />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full py-8 text-xl font-bold shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Publishing Course...
                    </div>
                  ) : 'Publish Course'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TopicsList({ lessonIndex, control, register }) {
  const { fields: topicFields, append: appendTopic, remove: removeTopic } = useFieldArray({
    control,
    name: `lessons.${lessonIndex}.topics`
  });

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {topicFields.map((topic, topicIndex) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0" />
            <div className="flex-1">
              <Input
                placeholder="Topic title..."
                className="h-10 text-sm bg-muted/20 border-muted-foreground/10"
                {...register(`lessons.${lessonIndex}.topics.${topicIndex}.title`, { required: true })}
              />
            </div>
            {topicFields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTopic(topicIndex)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => appendTopic({ title: '' })}
        className="text-primary hover:text-primary/80 hover:bg-primary/5 text-xs font-medium gap-1 h-8 pl-1"
      >
        <Plus className="h-3 w-3" /> Add Topic
      </Button>
    </div>
  );
}
