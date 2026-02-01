'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { productAPI, categoryAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Package, Plus, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState(['']);
  const [isCustomizable, setIsCustomizable] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const categoryId = watch('categoryId');

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

  const addImageField = () => {
    if (images.length < 10) {
      setImages([...images, '']);
    }
  };

  const removeImageField = (index) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const updateImage = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const onSubmit = async (data) => {
    const validImages = images.filter((img) => img.trim());
    if (validImages.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    if (!data.categoryId) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    try {
      await productAPI.create({
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        images: validImages,
        categoryId: data.categoryId,
        estimatedPrice: data.estimatedPrice ? parseFloat(data.estimatedPrice) : undefined,
        isCustomizable,
        metadata: {
          materialsUsed: data.materialsUsed ? data.materialsUsed.split(',').map((m) => m.trim()) : [],
          estimatedCreationTime: data.estimatedCreationTime,
          difficulty: data.difficulty,
        },
      });
      toast.success('Product created successfully!');
      router.push('/creator/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
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
                    <Package className="h-5 w-5" />
                    Create New Product
                  </CardTitle>
                  <CardDescription>
                    Share your handmade creation with the world
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Handmade Ceramic Vase"
                        {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Min 3 characters' } })}
                      />
                      {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shortDescription">Short Description</Label>
                      <Input
                        id="shortDescription"
                        placeholder="Brief summary (max 180 chars)"
                        maxLength={180}
                        {...register('shortDescription')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Full Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your product in detail..."
                        rows={5}
                        {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Min 20 characters' } })}
                      />
                      {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Images * (min 1, max 10)</Label>
                      {images.map((img, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Image URL"
                            value={img}
                            onChange={(e) => updateImage(index, e.target.value)}
                          />
                          {images.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeImageField(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {images.length < 10 && (
                        <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                          <Plus className="h-4 w-4 mr-1" /> Add Image
                        </Button>
                      )}
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

                    <div className="space-y-2">
                      <Label htmlFor="estimatedPrice">Estimated Price ($)</Label>
                      <Input
                        id="estimatedPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 49.99"
                        {...register('estimatedPrice')}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="customizable"
                        checked={isCustomizable}
                        onCheckedChange={setIsCustomizable}
                      />
                      <Label htmlFor="customizable">This product is customizable</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="materialsUsed">Materials Used</Label>
                      <Input
                        id="materialsUsed"
                        placeholder="e.g., Wood, Metal, Fabric (comma separated)"
                        {...register('materialsUsed')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estimatedCreationTime">Creation Time</Label>
                        <Input
                          id="estimatedCreationTime"
                          placeholder="e.g., 2 weeks"
                          {...register('estimatedCreationTime')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select onValueChange={(value) => setValue('difficulty', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Product
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
