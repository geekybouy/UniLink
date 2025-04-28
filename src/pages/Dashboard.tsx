
import React from 'react';
import { Search, Home, BookOpen, PlusSquare, MessageCircle, User, Bell, Shield } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from '../components/BottomNav';
import AlumniGrid from '../components/AlumniGrid';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-24" />
          <h1 className="text-2xl font-playfair text-primary font-bold">UniLink</h1>
          <div className="flex items-center gap-4">
            <Link 
              to="/credential-wallet" 
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Credentials
            </Link>
            <a 
              href="/cv-maker" 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              CV Maker
            </a>
            <button className="text-gray-600 hover:text-primary transition-colors">
              <MessageCircle className="h-6 w-6" />
            </button>
            <button className="text-gray-600 hover:text-primary transition-colors">
              <Bell className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-20">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Blockchain Credential Wallet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Store your academic and professional credentials securely using blockchain technology
                  </p>
                  <Button asChild>
                    <Link to="/credential-wallet">
                      <Shield className="mr-2 h-4 w-4" /> Access Your Credentials
                    </Link>
                  </Button>
                </div>
                <div className="bg-primary/20 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Create Professional CV</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Build and download professional CVs with our easy-to-use template
                  </p>
                  <Button asChild variant="outline" className="border-blue-500/50 text-blue-600">
                    <Link to="/cv-maker">
                      <BookOpen className="mr-2 h-4 w-4" /> Create CV
                    </Link>
                  </Button>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search Alumni..."
              className="pl-10 w-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select>
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
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nyc">New York</SelectItem>
                <SelectItem value="sf">San Francisco</SelectItem>
                <SelectItem value="lon">London</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alumni Grid */}
        <AlumniGrid />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;
