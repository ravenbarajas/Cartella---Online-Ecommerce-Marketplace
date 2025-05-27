import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, User, Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthModal } from "./AuthModal";

export function Navbar() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                <ShoppingCart className="inline-block mr-2 h-7 w-7" />
                Cartella
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-orange-500 hover:bg-orange-600">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </form>

                    {/* Mobile Navigation Links */}
                    <div className="space-y-2">
                      <Link href="/marketplace">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                          Marketplace
                        </Button>
                      </Link>
                      
                      {user ? (
                        <>
                          <Link href="/dashboard">
                            <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                              Dashboard
                            </Button>
                          </Link>
                          <Button variant="outline" className="w-full" onClick={() => { logout(); setIsMenuOpen(false); }}>
                            Logout
                          </Button>
                        </>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => { setShowAuthModal(true); setIsMenuOpen(false); }}
                        >
                          Sign In
                        </Button>
                      )}
                    </div>

                    {/* Theme Toggle */}
                    <Button
                      variant="ghost"
                      onClick={toggleTheme}
                      className="w-full justify-start"
                    >
                      {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                      {isDark ? "Light Mode" : "Dark Mode"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
