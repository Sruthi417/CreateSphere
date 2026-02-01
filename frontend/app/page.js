'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import {
  ArrowRight,
  Palette,
  ShoppingBag,
  Users,
  BookOpen,
  Sparkles,
  Star,
  CheckCircle2,
  Zap,
  Heart,
  MessageCircle,
  Bot,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function HomePage() {
  const { initializeAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const features = [
    {
      icon: ShoppingBag,
      title: 'Unique Marketplace',
      description: 'Discover one-of-a-kind handmade products from talented creators worldwide.',
    },
    {
      icon: BookOpen,
      title: 'Learn & Create',
      description: 'Access tutorials and guides to master new crafting techniques.',
    },
    {
      icon: Users,
      title: 'Creator Community',
      description: 'Connect with artisans, share ideas, and grow your creative network.',
    },
    {
      icon: Bot,
      title: 'AI Craft Assistant',
      description: 'Get personalized project ideas and guidance from our AI-powered chatbot.',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Explore',
      description: 'Browse thousands of unique handmade products and tutorials.',
    },
    {
      step: '02',
      title: 'Connect',
      description: 'Follow your favorite creators and chat directly with them.',
    },
    {
      step: '03',
      title: 'Create',
      description: 'Learn new skills with tutorials or become a creator yourself.',
    },
    {
      step: '04',
      title: 'Share',
      description: 'Share your creations with the community and inspire others.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Jewelry Designer',
      content: 'CraftSphere has transformed how I sell my handmade jewelry. The community is amazing!',
      rating: 5,
    },
    {
      name: 'David L.',
      role: 'Woodworking Enthusiast',
      content: 'The tutorials here taught me everything I know. Now I sell my own furniture pieces!',
      rating: 5,
    },
    {
      name: 'Emma K.',
      role: 'DIY Blogger',
      content: 'Best platform for finding unique crafts. The AI assistant helped me start my pottery journey.',
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
          <div className="container relative px-4 py-24 md:py-32 lg:py-40">
            <motion.div
              initial="initial"
              animate="animate"
              variants={stagger}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div variants={fadeInUp}>
                <Badge variant="outline" className="mb-4 px-4 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Welcome to the Creative Marketplace
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              >
                Where Creativity
                <span className="text-primary"> Meets </span>
                Community
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              >
                Discover unique handmade creations, learn new crafting skills, and connect with
                passionate artisans from around the world.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/explore/products">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {!isAuthenticated ? (
                  <Link href="/auth/signup">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Start Creating
                    </Button>
                  </Link>
                ) : (
                  <Link href="/creator/onboarding">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Become a Creator
                    </Button>
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Create</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From discovering unique products to learning new skills, we&apos;ve got you covered.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-background">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Getting started is easy. Join thousands of creators and craft enthusiasts today.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                  <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 right-0 w-1/2 border-t-2 border-dashed border-primary/20" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Creators</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of happy creators who have found their creative home.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4">&quot;{testimonial.content}&quot;</p>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12 lg:p-16 text-center text-primary-foreground"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Creative Journey?
              </h2>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                Join CraftSphere today and become part of a thriving community of makers, creators,
                and craft enthusiasts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" variant="secondary">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/chatbot">
                  <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                    Try AI Assistant
                    <Bot className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Decorative */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
