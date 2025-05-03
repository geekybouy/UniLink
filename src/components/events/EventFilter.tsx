
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Filter, Calendar } from "lucide-react";

interface EventFilterProps {
  onFilterChange: (filters: EventFilters) => void;
}

export interface EventFilters {
  search: string;
  category: string | null;
  dateRange: 'all' | 'today' | 'this-week' | 'this-month';
  showVirtual: boolean;
  showRegistered: boolean;
}

const EVENT_CATEGORIES = [
  { label: 'All Categories', value: 'all' }, // Changed from empty string to 'all'
  { label: 'Webinar', value: 'webinar' },
  { label: 'Meetup', value: 'meetup' },
  { label: 'Reunion', value: 'reunion' },
  { label: 'Conference', value: 'conference' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Networking', value: 'networking' },
  { label: 'Career Fair', value: 'career_fair' },
  { label: 'Social', value: 'social' },
  { label: 'Other', value: 'other' },
];

const TIME_PERIODS = [
  { label: 'All Events', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this-week' },
  { label: 'This Month', value: 'this-month' },
];

export const EventFilter: React.FC<EventFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    category: null,
    dateRange: 'all',
    showVirtual: false,
    showRegistered: false,
  });

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          className="pl-10"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/3">
          <Select 
            value={filters.category || 'all'} // Changed from empty string to 'all'
            onValueChange={(value) => handleFilterChange('category', value === 'all' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-1/3">
          <Select 
            value={filters.dateRange} 
            onValueChange={(value: 'all' | 'today' | 'this-week' | 'this-month') => 
              handleFilterChange('dateRange', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIODS.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-1/3 flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="virtual" 
              checked={filters.showVirtual}
              onCheckedChange={(checked) => 
                handleFilterChange('showVirtual', Boolean(checked))
              }
            />
            <Label htmlFor="virtual">Virtual</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="registered" 
              checked={filters.showRegistered}
              onCheckedChange={(checked) => 
                handleFilterChange('showRegistered', Boolean(checked))
              }
            />
            <Label htmlFor="registered">My Events</Label>
          </div>
        </div>
      </div>
    </div>
  );
};
