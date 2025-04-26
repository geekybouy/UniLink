
import React from 'react';
import { Search, Home, BookOpen, PlusSquare, MessageCircle, User, Bell } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from '../components/BottomNav';
import AlumniGrid from '../components/AlumniGrid';

const Dashboard = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-24" /> {/* Spacer */}
          <h1 className="text-2xl font-playfair text-primary font-bold">UniLink</h1>
          <div className="flex items-center gap-4">
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
