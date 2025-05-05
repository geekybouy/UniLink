
import React, { useState, useEffect } from 'react';
import { useMentorship } from '@/contexts/MentorshipContext';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MentorGrid } from '@/components/mentorship/MentorGrid';
import { RequestMentorshipDialog } from '@/components/mentorship/RequestMentorshipDialog';
import { MentorWithProfile } from '@/types/mentorship';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Search, Filter } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export function FindMentors() {
  const { getAllMentors, findMentorMatches, requestMentorship } = useMentorship();
  
  const [mentors, setMentors] = useState<MentorWithProfile[]>([]);
  const [matchedMentors, setMatchedMentors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFindingMatches, setIsFindingMatches] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [filterInput, setFilterInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState({ id: '', userId: '', name: '' });
  
  useEffect(() => {
    const loadMentors = async () => {
      setIsLoading(true);
      try {
        const mentorsData = await getAllMentors();
        setMentors(mentorsData);
      } catch (error) {
        console.error('Error loading mentors:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMentors();
  }, [getAllMentors]);
  
  const handleRequestMentorship = (mentorId: string, userId: string) => {
    const mentor = mentors.find(m => m.id === mentorId);
    if (mentor) {
      setSelectedMentor({
        id: mentorId,
        userId,
        name: mentor.profile.full_name
      });
      setDialogOpen(true);
    }
  };
  
  const handleSubmitRequest = async (formData) => {
    try {
      await requestMentorship({
        goals: formData.goals,
        message: formData.message,
        interests: formData.interests,
        mentor_id: formData.mentorId
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };
  
  const handleAddFilter = () => {
    if (filterInput.trim() && !filters.includes(filterInput.trim())) {
      setFilters([...filters, filterInput.trim()]);
      setFilterInput('');
    }
  };
  
  const removeFilter = (filter: string) => {
    setFilters(filters.filter(f => f !== filter));
  };
  
  const handleFindMatches = async () => {
    if (interests.length === 0) return;
    
    setIsFindingMatches(true);
    try {
      const matches = await findMentorMatches(interests);
      setMatchedMentors(matches);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setIsFindingMatches(false);
    }
  };
  
  const handleInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterInput(e.target.value);
  };
  
  const handleAddInterest = () => {
    if (filterInput.trim() && !interests.includes(filterInput.trim())) {
      setInterests([...interests, filterInput.trim()]);
      setFilterInput('');
    }
  };
  
  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };
  
  const filteredMentors = mentors.filter(mentor => {
    const nameMatch = mentor.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filters.length === 0) return nameMatch;
    
    const expertiseMatch = filters.some(filter => 
      mentor.expertise.some(exp => exp.toLowerCase().includes(filter.toLowerCase()))
    );
    
    return nameMatch && expertiseMatch;
  });

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find a Mentor</h1>
          <p className="text-muted-foreground max-w-3xl">
            Connect with experienced professionals who can guide you in your career journey.
            Use the search or filters to find mentors that match your interests.
          </p>
        </div>

        <Tabs defaultValue="browse">
          <TabsList className="mb-8">
            <TabsTrigger value="browse">Browse Mentors</TabsTrigger>
            <TabsTrigger value="match">Find Your Match</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="mb-8 space-y-4">
              <div className="flex gap-3 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search mentors by name..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Filter by expertise..."
                      className="pl-9"
                      value={filterInput}
                      onChange={(e) => setFilterInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFilter();
                        }
                      }}
                    />
                  </div>
                  <Button onClick={handleAddFilter}>Add</Button>
                </div>
              </div>
              
              {filters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {filter}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeFilter(filter)} 
                      />
                    </Badge>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs" 
                    onClick={() => setFilters([])}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            <MentorGrid 
              mentors={filteredMentors}
              onRequestMentorship={handleRequestMentorship}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="match">
            <div className="mb-8 space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-2">What are your interests?</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your interests to find mentors who can help you in these areas
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="E.g. Web Development, Leadership..."
                    value={filterInput}
                    onChange={handleInterestChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                  />
                  <Button onClick={handleAddInterest}>Add</Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {interest}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeInterest(interest)} 
                      />
                    </Badge>
                  ))}
                  {interests.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs" 
                      onClick={() => setInterests([])}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                
                <Button 
                  onClick={handleFindMatches} 
                  disabled={interests.length === 0 || isFindingMatches}
                >
                  {isFindingMatches ? <Spinner className="mr-2" /> : null}
                  Find My Matches
                </Button>
              </div>

              {matchedMentors.length > 0 && (
                <div className="pt-4">
                  <h2 className="text-xl font-semibold mb-6">Your Mentor Matches</h2>
                  <MentorGrid 
                    mentors={matchedMentors}
                    onRequestMentorship={(mentorId, userId) => handleRequestMentorship(mentorId, userId)}
                    showMatchScore={true}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <RequestMentorshipDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmitRequest}
          mentorId={selectedMentor.id}
          mentorName={selectedMentor.name}
        />
      </div>
    </MainLayout>
  );
}

export default FindMentors;
