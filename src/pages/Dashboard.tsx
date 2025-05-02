
import React, { useState } from 'react';
import { Search, Home, BookOpen, PlusSquare, User, Bell, Shield, Menu, X, Users } from 'lucide-react';
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
import Header from '@/components/Header';

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
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 pb-20 md:pb-4">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
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
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Alumni Directory</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 md:line-clamp-none">
                    Connect with alumni from your university around the world
                  </p>
                  <Button asChild variant="outline" className="border-purple-500/50 text-purple-600">
                    <Link to="/alumni-directory">
                      <Users className="mr-2 h-4 w-4" /> Explore Directory
                    </Link>
                  </Button>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full hidden sm:block">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Alumni Highlights */}
        <div className="space-y-4 mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Featured Alumni</h2>
            <Button variant="link" asChild>
              <Link to="/alumni-directory">View all</Link>
            </Button>
          </div>
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
