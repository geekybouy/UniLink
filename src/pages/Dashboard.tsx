
import React, { useState } from 'react';
import { Search, Home, BookOpen, PlusSquare, User, Bell, Shield, Menu, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import BottomNav from '../components/BottomNav';
import AlumniGrid from '../components/AlumniGrid';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const isMobile = useIsMobile();
  const [activeFilters, setActiveFilters] = useState({
    year: null,
    location: null,
    course: null
  });
  const [showFilters, setShowFilters] = useState(!isMobile);

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      year: null,
      location: null,
      course: null
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col gap-6 py-4">
                  <h2 className="text-xl font-bold text-primary">UniLink</h2>
                  <div className="flex flex-col space-y-3">
                    <Link 
                      to="/credential-wallet" 
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                      <Shield className="h-4 w-4" /> Credentials Wallet
                    </Link>
                    <Link 
                      to="/cv-maker" 
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                      <BookOpen className="h-4 w-4" /> CV Maker
                    </Link>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="w-24" />
          )}
          <Link to="/dashboard" className="text-2xl font-playfair text-primary font-bold">UniLink</Link>
          <div className="flex items-center gap-2 md:gap-4">
            {!isMobile && (
              <>
                <Link 
                  to="/credential-wallet" 
                  className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Credentials
                </Link>
                <Link 
                  to="/cv-maker" 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  CV Maker
                </Link>
              </>
            )}
            <button className="text-gray-600 hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <Link to="/profile" className="text-gray-600 hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-20 md:pb-4">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Blockchain Credential Wallet</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 md:line-clamp-none">
                    Store your academic and professional credentials securely using blockchain technology
                  </p>
                  <Button asChild>
                    <Link to="/credential-wallet">
                      <Shield className="mr-2 h-4 w-4" /> Access Your Credentials
                    </Link>
                  </Button>
                </div>
                <div className="bg-primary/20 p-3 rounded-full hidden sm:block">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Create Professional CV</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 md:line-clamp-none">
                    Build and download professional CVs with our easy-to-use template
                  </p>
                  <Button asChild variant="outline" className="border-blue-500/50 text-blue-600">
                    <Link to="/cv-maker">
                      <BookOpen className="mr-2 h-4 w-4" /> Create CV
                    </Link>
                  </Button>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full hidden sm:block">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-4 mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Alumni Directory</h2>
            {isMobile && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                {activeFilters.year || activeFilters.location || activeFilters.course ? (
                  <Badge variant="secondary" className="h-5 flex items-center">
                    Filters active
                  </Badge>
                ) : (
                  "Filters"
                )}
                {showFilters ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              </Button>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search Alumni..."
              className="pl-10 w-full"
            />
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select 
                value={activeFilters.year || ""} 
                onValueChange={(value) => handleFilterChange('year', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Batch Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={activeFilters.location || ""}
                onValueChange={(value) => handleFilterChange('location', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nyc">New York</SelectItem>
                  <SelectItem value="sf">San Francisco</SelectItem>
                  <SelectItem value="lon">London</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={activeFilters.course || ""}
                onValueChange={(value) => handleFilterChange('course', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                </SelectContent>
              </Select>
              {(activeFilters.year || activeFilters.location || activeFilters.course) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters} 
                  className="text-xs sm:col-span-3 w-fit ml-auto"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Alumni Grid */}
        <AlumniGrid />
      </main>

      {/* Bottom Navigation - Only show on mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default Dashboard;
