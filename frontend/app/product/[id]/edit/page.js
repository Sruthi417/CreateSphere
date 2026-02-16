'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Package, Plus, X, Loader2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import ProductImageUpload from '@/components/product-image-upload';

export default function EditProductPage() {
    const params = useParams();
    const productId = params.id;
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [isCustomizable, setIsCustomizable] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm();

    const categoryIdValue = watch('categoryId');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        fetchData();
    }, [isAuthenticated, productId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, productRes] = await Promise.all([
                categoryAPI.list(),
                productAPI.getById(productId)
            ]);

            setCategories(categoriesRes.data.data || []);

            const product = productRes.data.data;

            // Check ownership
            const creatorId = typeof product.creatorId === 'object' ? product.creatorId._id : product.creatorId;
            if (user && creatorId !== user._id) {
                toast.error('You do not have permission to edit this product');
                router.push(`/product/${productId}`);
                return;
            }

            // Pre-fill form
            reset({
                title: product.title,
                description: product.description,
                shortDescription: product.shortDescription,
                categoryId: typeof product.categoryId === 'object' ? product.categoryId._id : product.categoryId,
                estimatedPrice: product.estimatedPrice,
                materialsUsed: product.metadata?.materialsUsed?.join(', '),
                estimatedCreationTime: product.metadata?.estimatedCreationTime,
                difficulty: product.metadata?.difficulty,
            });

            setImages(product.images || []);
            setIsCustomizable(product.isCustomizable || false);

        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load product data');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        if (images.length === 0) {
            toast.error('At least one image is required');
            return;
        }

        if (!data.categoryId) {
            toast.error('Please select a category');
            return;
        }

        setSaving(true);
        try {
            await productAPI.update(productId, {
                title: data.title,
                description: data.description,
                shortDescription: data.shortDescription,
                images: images,
                categoryId: data.categoryId,
                estimatedPrice: data.estimatedPrice ? parseFloat(data.estimatedPrice) : undefined,
                isCustomizable,
                metadata: {
                    materialsUsed: data.materialsUsed ? data.materialsUsed.split(',').map((m) => m.trim()) : [],
                    estimatedCreationTime: data.estimatedCreationTime,
                    difficulty: data.difficulty,
                },
            });
            toast.success('Product updated successfully!');
            router.push(`/product/${productId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 container px-4 py-16 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                        <Link href={`/product/${productId}`} className="text-muted-foreground hover:text-foreground text-sm flex items-center mb-6">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Product
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Edit Product
                                    </CardTitle>
                                    <CardDescription>
                                        Update your product information
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
                                            <Label>Images * (min 1, max 5)</Label>
                                            <ProductImageUpload images={images} setImages={setImages} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Category *</Label>
                                            <Select onValueChange={(value) => setValue('categoryId', value)} value={categoryIdValue}>
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
                                                <Select onValueChange={(value) => setValue('difficulty', value)} defaultValue={watch('difficulty')}>
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

                                        <Button type="submit" className="w-full" disabled={saving}>
                                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
