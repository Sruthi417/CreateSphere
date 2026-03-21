'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Menu,
  X,
  User,
  Heart,
  MessageCircle,
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  Palette,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, userRole, logout, initializeAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeAuth();
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/explore/products', label: 'Market' },
    { href: '/explore/creators', label: 'Designers' },
    { href: '/explore/tutorials', label: 'Courses' },
  ];

  const isAdmin = userRole === 'admin';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b bg-background/95 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-background/80'
          : 'bg-background border-b border-border/50'
      }`}
    >
      <nav className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center space-x-2 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-primary/30 group-hover:-rotate-3 transition-all duration-300">
            <Palette className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            CraftSphere{' '}
            {isAdmin && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ml-1 font-semibold">
                ADMIN
              </span>
            )}
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isAdmin && (
          <div className="hidden md:flex items-center bg-muted/50 rounded-full px-1 py-1 gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  pathname === link.href || pathname?.startsWith(link.href)
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}



        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {mounted ? (
            <>
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden md:flex h-9 w-9 rounded-full"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {isAuthenticated ? (
                <>
                  {!isAdmin && (
                    <>
                      <Link href="/user/favorites" className="hidden md:block">
                        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/chat" className="hidden md:block">
                        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </Link>
                    </>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={getImageUrl(user?.avatarUrl)} alt={user?.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-2xl" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getImageUrl(user?.avatarUrl)} alt={user?.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-0.5 leading-none">
                          <p className="font-semibold text-sm">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.email}</p>
                          {isAdmin && <BadgeLabel>ADMINISTRATOR</BadgeLabel>}
                        </div>
                      </div>
                      <DropdownMenuSeparator />

                      {isAdmin ? (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard" className="cursor-pointer">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/user/profile" className="cursor-pointer">
                              <User className="mr-2 h-4 w-4" />
                              Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/user/favorites" className="cursor-pointer">
                              <Heart className="mr-2 h-4 w-4" />
                              Favorites
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/chat" className="cursor-pointer">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Messages
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {userRole === 'creator' ? (
                            <DropdownMenuItem asChild>
                              <Link href="/creator/dashboard" className="cursor-pointer text-primary font-semibold">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Creator Dashboard
                              </Link>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem asChild>
                              <Link href="/creator/onboarding" className="cursor-pointer text-primary">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Become a Creator
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="rounded-full text-sm font-medium">Log in</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="rounded-full text-sm font-medium shadow-none hover:shadow-none">Sign up</Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background/95 backdrop-blur-md"
          >
            <div className="container py-4 px-4 space-y-4">
              {!isAdmin && (
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        pathname === link.href || pathname?.startsWith(link.href)
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="block px-4 py-2.5 rounded-xl text-sm font-bold text-primary bg-primary/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4 inline mr-2" />
                  Admin Dashboard
                </Link>
              )}

              {/* Theme Toggle Mobile */}
              <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-muted/50">
                <span className="text-sm font-medium">Appearance</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-2 rounded-full"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Dark Mode
                    </>
                  )}
                </Button>
              </div>

              {!isAuthenticated && (
                <div className="flex space-x-2 pt-1">
                  <Link href="/auth/login" className="flex-1">
                    <Button variant="outline" className="w-full rounded-full" onClick={() => setMobileMenuOpen(false)}>
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="flex-1">
                    <Button className="w-full rounded-full" onClick={() => setMobileMenuOpen(false)}>
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function BadgeLabel({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold transition-colors border-transparent bg-primary text-primary-foreground ${className}`}>
      {children}
    </span>
  );
}
