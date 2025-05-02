
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, X, ArrowDownAZ, ArrowUpZA, CalendarIcon, Clock } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AlumniFilters, SortOption } from "@/pages/AlumniDirectory";

type AlumniSearchFiltersProps = {
  filters: AlumniFilters;
  sortBy: SortOption;
  onFilterChange: (filters: Partial<AlumniFilters>) => void;
  onSortChange: (sortOption: SortOption) => void;
  availableFilters: {
    years: number[];
    courses: string[];
    companies: string[];
    locations: string[];
    skills: string[];
  };
};

const AlumniSearchFilters = ({ 
  filters, 
  sortBy, 
  onFilterChange, 
  onSortChange,
  availableFilters
}: AlumniSearchFiltersProps) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      graduationYear: null,
      course: null,
      company: null,
      location: null,
      skill: null
    });
  };

  const getSortLabel = (sort: SortOption): string => {
    switch(sort) {
      case 'name_asc': return 'Name (A-Z)';
      case 'name_desc': return 'Name (Z-A)';
      case 'year_asc': return 'Graduation Year (Ascending)';
      case 'year_desc': return 'Graduation Year (Descending)';
      case 'recent': return 'Most Recent';
      default: return 'Name (A-Z)';
    }
  };

  const getSortIcon = (sort: SortOption) => {
    switch(sort) {
      case 'name_asc': return <ArrowDownAZ className="h-4 w-4" />;
      case 'name_desc': return <ArrowUpZA className="h-4 w-4" />;
      case 'year_asc': return <CalendarIcon className="h-4 w-4" />;
      case 'year_desc': return <CalendarIcon className="h-4 w-4" />;
      case 'recent': return <Clock className="h-4 w-4" />;
      default: return <ArrowDownAZ className="h-4 w-4" />;
    }
  };

  // Count active filters
  const activeFilterCount = [
    filters.graduationYear,
    filters.course,
    filters.company,
    filters.location,
    filters.skill
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search and mobile filter toggle */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search alumni by name..."
            className="pl-10"
          />
        </div>
        
        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-between min-w-[180px]">
              <span className="flex items-center gap-2">
                {getSortIcon(sortBy)}
                <span className="hidden sm:inline">Sort by:</span> {getSortLabel(sortBy)}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onSortChange('name_asc')}>
                <ArrowDownAZ className="mr-2 h-4 w-4" />
                <span>Name (A-Z)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('name_desc')}>
                <ArrowUpZA className="mr-2 h-4 w-4" />
                <span>Name (Z-A)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('year_asc')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Graduation Year (Ascending)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('year_desc')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Graduation Year (Descending)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('recent')}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Most Recent</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Mobile filter toggle */}
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="sm:hidden"
        >
          {activeFilterCount > 0 ? (
            <>
              Filters <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
            </>
          ) : (
            'Filters'
          )}
        </Button>
      </div>

      {/* Filters - Responsive */}
      <div className={`grid grid-cols-1 sm:grid-cols-5 gap-2 ${showMobileFilters ? 'block' : 'hidden sm:grid'}`}>
        {/* Year Filter */}
        <Select 
          value={filters.graduationYear || "all_years"}
          onValueChange={(value) => onFilterChange({ graduationYear: value === "all_years" ? null : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Batch Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Batch Year</SelectLabel>
              <SelectItem value="all_years">All Years</SelectItem>
              {availableFilters.years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        {/* Course Filter */}
        <Select
          value={filters.course || "all_courses"}
          onValueChange={(value) => onFilterChange({ course: value === "all_courses" ? null : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Course</SelectLabel>
              <SelectItem value="all_courses">All Courses</SelectItem>
              {availableFilters.courses.map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        {/* Company Filter */}
        <Select
          value={filters.company || "all_companies"}
          onValueChange={(value) => onFilterChange({ company: value === "all_companies" ? null : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Company</SelectLabel>
              <SelectItem value="all_companies">All Companies</SelectItem>
              {availableFilters.companies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        {/* Location Filter */}
        <Select
          value={filters.location || "all_locations"}
          onValueChange={(value) => onFilterChange({ location: value === "all_locations" ? null : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Location</SelectLabel>
              <SelectItem value="all_locations">All Locations</SelectItem>
              {availableFilters.locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        {/* Skills Filter */}
        <Select
          value={filters.skill || "all_skills"}
          onValueChange={(value) => onFilterChange({ skill: value === "all_skills" ? null : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Skill</SelectLabel>
              <SelectItem value="all_skills">All Skills</SelectItem>
              {availableFilters.skills.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center mt-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.graduationYear && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Batch: {filters.graduationYear}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onFilterChange({ graduationYear: null })} />
            </Badge>
          )}
          {filters.course && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Course: {filters.course}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onFilterChange({ course: null })} />
            </Badge>
          )}
          {filters.company && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Company: {filters.company}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onFilterChange({ company: null })} />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Location: {filters.location}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onFilterChange({ location: null })} />
            </Badge>
          )}
          {filters.skill && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Skill: {filters.skill}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onFilterChange({ skill: null })} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-6 text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default AlumniSearchFilters;
