'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
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
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, userRole, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore/products?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/explore/products', label: 'Products' },
    { href: '/explore/tutorials', label: 'Tutorials' },
    { href: '/explore/creators', label: 'Creators' },
  ];

  const isAdmin = userRole === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href={isAdmin ? "/admin/dashboard" : "/"} className="flex items-center space-x-2">
          <Palette className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">CraftSphere <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">{isAdmin ? 'ADMIN' : ''}</span></span>
        </Link>

        {/* Desktop Navigation - Hidden for Admin */}
        {!isAdmin && (
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Search Bar - Hidden for Admin */}
        {!isAdmin && (
          <div className="hidden md:flex relative max-w-sm flex-1 mx-6">
            {mounted ? (
              <form onSubmit={handleSearch} className="w-full relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products, tutorials..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            ) : (
              <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
            )}
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {mounted ? (
            <>
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden md:flex"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {isAuthenticated ? (
                <>
                  {!isAdmin && (
                    <>
                      <Link href="/user/favorites" className="hidden md:block">
                        <Button variant="ghost" size="icon">
                          <Heart className="h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/chat" className="hidden md:block">
                        <Button variant="ghost" size="icon">
                          <MessageCircle className="h-5 w-5" />
                        </Button>
                      </Link>
                    </>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getImageUrl(user?.avatarUrl)} alt={user?.name} />
                          <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                          {isAdmin && <Badge className="w-fit text-[8px] h-3 px-1">ADMINISTRATOR</Badge>}
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
                                <Palette className="mr-2 h-4 w-4" />
                                Become a Creator
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>Sign up</Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
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
            className="md:hidden border-t bg-background"
          >
            <div className="container py-4 px-4 space-y-4">
              {!isAdmin && (
                <>
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-10 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>

                  <div className="space-y-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block py-2 text-sm font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="block py-2 text-sm font-bold text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4 inline mr-2" />
                  Admin Dashboard
                </Link>
              )}

              {/* Theme Toggle Mobile */}
              <div className="flex items-center justify-between py-2 border-t pt-4">
                <span className="text-sm font-medium">Appearance</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-2"
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
                <div className="flex space-x-2 pt-2 border-t">
                  <Link href="/auth/login" className="flex-1">
                    <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      Log in
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="flex-1">
                    <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
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

function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 ${className}`}>
      {children}
    </span>
  );
}
