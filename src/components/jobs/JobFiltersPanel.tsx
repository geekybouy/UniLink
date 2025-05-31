
import React, { useState } from 'react';
import { Check, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { JobFilters, JobType } from '@/types/jobs';

interface JobFiltersPanelProps {
  filters: JobFilters;
  onFilterChange: (filters: JobFilters) => void;
  availableLocations: string[];
}

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const EXPERIENCE_LEVELS = [
  'Entry Level',
  'Mid Level',
  'Senior Level',
  'Executive',
];

export default function JobFiltersPanel({ filters, onFilterChange, availableLocations }: JobFiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<JobFilters>(filters);

  const handleJobTypeChange = (type: JobType, checked: boolean) => {
    let updatedTypes = tempFilters.job_type || [];
    
    if (checked) {
      updatedTypes = [...updatedTypes, type];
    } else {
      updatedTypes = updatedTypes.filter(t => t !== type);
    }
    
    setTempFilters({ ...tempFilters, job_type: updatedTypes });
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    let updatedLocations = tempFilters.locations || [];
    
    if (checked) {
      updatedLocations = [...updatedLocations, location];
    } else {
      updatedLocations = updatedLocations.filter(loc => loc !== location);
    }
    
    setTempFilters({ ...tempFilters, locations: updatedLocations });
  };

  const handleExperienceLevelChange = (level: string) => {
    setTempFilters({ ...tempFilters, experience_level: level });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempFilters({ ...tempFilters, search: e.target.value });
  };

  const applyFilters = () => {
    onFilterChange(tempFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const resetFilters: JobFilters = {};
    setTempFilters(resetFilters);
    onFilterChange(resetFilters);
    setIsOpen(false);
  };

  const activeFilterCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  }).length;

  return (
    <div className="mb-6 w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Jobs</SheetTitle>
            </SheetHeader>

            <div className="py-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Search</h3>
                <Input 
                  placeholder="Search job title or keywords" 
                  value={tempFilters.search || ''}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Job Type</h3>
                <div className="grid grid-cols-1 gap-2">
                  {JOB_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`job-type-${type.value}`}
                        checked={(tempFilters.job_type || []).includes(type.value)}
                        onCheckedChange={(checked) => handleJobTypeChange(type.value, checked as boolean)}
                      />
                      <Label htmlFor={`job-type-${type.value}`} className="cursor-pointer">{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Experience Level</h3>
                <div className="grid grid-cols-1 gap-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`exp-level-${level}`}
                        name="experience-level"
                        className="text-primary"
                        checked={tempFilters.experience_level === level}
                        onChange={() => handleExperienceLevelChange(level)}
                      />
                      <Label htmlFor={`exp-level-${level}`} className="cursor-pointer">{level}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {availableLocations.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {availableLocations.map((location) => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`location-${location}`}
                          checked={(tempFilters.locations || []).includes(location)}
                          onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                        />
                        <Label htmlFor={`location-${location}`} className="cursor-pointer">{location}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 pt-4">
                <Button onClick={applyFilters}>Apply Filters</Button>
                <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Active filter badges */}
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1 py-1 pl-2 pr-1">
              {filters.search}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 rounded-full"
                onClick={() => onFilterChange({ ...filters, search: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.job_type && filters.job_type.map(type => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1 py-1 pl-2 pr-1">
              {type}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 rounded-full"
                onClick={() => onFilterChange({ 
                  ...filters, 
                  job_type: filters.job_type?.filter(t => t !== type)
                })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filters.experience_level && (
            <Badge variant="secondary" className="flex items-center gap-1 py-1 pl-2 pr-1">
              {filters.experience_level}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 rounded-full"
                onClick={() => onFilterChange({ ...filters, experience_level: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.locations && filters.locations.map(location => (
            <Badge key={location} variant="secondary" className="flex items-center gap-1 py-1 pl-2 pr-1">
              {location}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 rounded-full"
                onClick={() => onFilterChange({ 
                  ...filters, 
                  locations: filters.locations?.filter(loc => loc !== location)
                })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {activeFilterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={resetFilters}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
