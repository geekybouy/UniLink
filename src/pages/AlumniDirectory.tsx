import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';
import AlumniSearchFilters from '@/components/alumni/AlumniSearchFilters';
import AlumniGrid from '@/components/alumni/AlumniGrid';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/alumni/Pagination';

export type AlumniFilters = {
  search: string;
  graduationYear: string | null;
  course: string | null;
  company: string | null;
  location: string | null;
  skill: string | null;
};

export type SortOption = 'name_asc' | 'name_desc' | 'year_asc' | 'year_desc' | 'recent';

const AlumniDirectory = () => {
  const [loading, setLoading] = useState(true);
  const [alumni, setAlumni] = useState<UserProfile[]>([]);
  const [totalAlumni, setTotalAlumni] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AlumniFilters>({
    search: '',
    graduationYear: null,
    course: null,
    company: null,
    location: null,
    skill: null
  });
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [availableFilters, setAvailableFilters] = useState({
    years: [] as number[],
    courses: [] as string[],
    companies: [] as string[],
    locations: [] as string[],
    skills: [] as string[]
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const itemsPerPage = 9;

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Get unique graduation years
        const { data: yearsData } = await supabase
          .from('profiles')
          .select('graduation_year')
          .not('graduation_year', 'is', null)
          .order('graduation_year', { ascending: false });

        // Get unique branches (courses)
        const { data: coursesData } = await supabase
          .from('profiles')
          .select('branch')
          .not('branch', 'is', null);

        // Get unique companies
        const { data: companiesData } = await supabase
          .from('profiles')
          .select('current_company')
          .not('current_company', 'is', null);

        // Get unique locations
        const { data: locationsData } = await supabase
          .from('profiles')
          .select('location')
          .not('location', 'is', null);

        // Get all skills (this is more complex since skills are stored as an array)
        const { data: skillsData } = await supabase
          .from('profiles')
          .select('skills')
          .not('skills', 'is', null);

        // Process the data to get unique values
        const years = [...new Set(yearsData?.map(item => item.graduation_year) || [])];
        const courses = [...new Set(coursesData?.map(item => item.branch) || [])];
        const companies = [...new Set(companiesData?.map(item => item.current_company) || [])];
        const locations = [...new Set(locationsData?.map(item => item.location) || [])];
        
        // Flatten skills array and get unique values
        const allSkills = skillsData?.flatMap(item => item.skills || []) || [];
        const skills = [...new Set(allSkills)];

        setAvailableFilters({
          years: years as number[],
          courses: courses as string[],
          companies: companies as string[],
          locations: locations as string[],
          skills: skills as string[]
        });
      } catch (error) {
        console.error("Error fetching filter options:", error);
        toast({
          title: "Error",
          description: "Failed to load filter options",
          variant: "destructive"
        });
      }
    };

    fetchFilterOptions();
  }, [toast]);

  // Fetch alumni data with pagination and filters
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        
        // Start building the query
        let query = supabase
          .from('profiles')
          .select('*', { count: 'exact' });
        
        // Apply filters
        if (filters.search) {
          query = query.or(`full_name.ilike.%${filters.search}%,username.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
        }
        
        if (filters.graduationYear) {
          const yearNumber = parseInt(filters.graduationYear);
          if (!isNaN(yearNumber)) {
            query = query.eq('graduation_year', yearNumber);
          }
        }
        
        if (filters.course) {
          query = query.eq('branch', filters.course);
        }
        
        if (filters.company) {
          query = query.eq('current_company', filters.company);
        }
        
        if (filters.location) {
          query = query.eq('location', filters.location);
        }
        
        if (filters.skill) {
          // For array columns, use the contains operator
          query = query.contains('skills', [filters.skill]);
        }
        
        // Apply sorting
        switch(sortBy) {
          case 'name_asc':
            query = query.order('full_name', { ascending: true });
            break;
          case 'name_desc':
            query = query.order('full_name', { ascending: false });
            break;
          case 'year_asc':
            query = query.order('graduation_year', { ascending: true });
            break;
          case 'year_desc':
            query = query.order('graduation_year', { ascending: false });
            break;
          case 'recent':
            // Assuming there's an updated_at field, otherwise use created_at
            query = query.order('id', { ascending: false });
            break;
          default:
            query = query.order('full_name', { ascending: true });
        }
        
        // Apply pagination
        query = query
          .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);
        
        // Execute the query
        const { data, count, error } = await query;
        
        if (error) throw error;
        
        // Transform the Supabase data structure to match our UserProfile type
        const transformedAlumni: UserProfile[] = data?.map(profile => ({
          id: profile.id.toString(),
          name: profile.full_name,
          username: profile.username || '',
          email: profile.email,
          phone_number: null,
          bio: profile.bio || null,
          location: profile.location || null,
          is_profile_complete: profile.is_profile_complete || false,
          profile_image_url: profile.avatar_url || null,
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || new Date().toISOString(),
        })) || [];
        
        setAlumni(transformedAlumni);
        setTotalAlumni(count || 0);
      } catch (error) {
        console.error("Error fetching alumni:", error);
        toast({
          title: "Error",
          description: "Failed to load alumni directory",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [filters, sortBy, page, toast]);

  const handleFilterChange = (newFilters: Partial<AlumniFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    // Reset to first page when filters change
    setPage(1);
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo(0, 0);
  };

  const handleConnect = (profileId: string) => {
    // In a real app, this would send a connection request
    toast({
      title: "Connection request sent",
      description: "Your connection request has been sent.",
    });
  };

  const handleMessage = (profileId: string) => {
    // In a real app, this would open a messaging interface
    toast({
      title: "Message feature",
      description: "Messaging functionality coming soon!",
    });
  };

  const handleViewProfile = (profileId: string) => {
    navigate(`/profile/${profileId}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Alumni Directory</h1>
            <p className="text-muted-foreground">
              Connect with {totalAlumni} alumni from your university
            </p>
          </div>
        </div>
        
        {/* Filters and Sort */}
        <AlumniSearchFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          sortBy={sortBy}
          availableFilters={availableFilters}
        />
        
        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <div key={index} className="border rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex space-x-2 mt-4">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : alumni.length === 0 ? (
          // Empty state
          <div className="border rounded-lg p-12 mt-6 flex flex-col items-center justify-center text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No alumni found</h3>
            <p className="text-muted-foreground mb-6">
              No alumni matching your search criteria. Try adjusting your filters.
            </p>
            <Button onClick={() => {
              setFilters({
                search: '',
                graduationYear: null,
                course: null,
                company: null,
                location: null,
                skill: null
              });
              setSortBy('name_asc');
            }}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            {/* Alumni grid */}
            <AlumniGrid 
              alumni={alumni} 
              onConnect={handleConnect}
              onMessage={handleMessage}
              onViewProfile={handleViewProfile}
            />
            
            {/* Pagination */}
            {totalAlumni > itemsPerPage && (
              <div className="mt-6">
                <Pagination 
                  currentPage={page}
                  totalItems={totalAlumni}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AlumniDirectory;
