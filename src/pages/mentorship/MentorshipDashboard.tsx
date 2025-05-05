
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useMentorship } from '@/contexts/MentorshipContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/layouts/MainLayout';
import { RelationshipCard } from '@/components/mentorship/RelationshipCard';
import { MentorshipRelationship, MentorWithProfile, MentorshipSession } from '@/types/mentorship';
import { SessionCard } from '@/components/mentorship/SessionCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScheduleSessionForm } from '@/components/mentorship/ScheduleSessionForm';
import { ResourcesDialog } from '@/components/mentorship/ResourcesDialog';
import { FeedbackForm } from '@/components/mentorship/FeedbackForm';
import { Spinner } from '@/components/ui/spinner';
import { RequestsList } from '@/components/mentorship/RequestsList';

export function MentorshipDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getMentorProfile,
    getMentorshipRelationships,
    getMentorshipRequests,
    getUpcomingSessions,
    getPastSessions,
    scheduleSession,
    updateSessionStatus,
    acceptMentorshipRequest,
    rejectMentorshipRequest,
    cancelMentorshipRequest,
    getRelationshipResources,
    shareResource,
    submitSessionFeedback,
  } = useMentorship();

  const [isMentor, setIsMentor] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relationships, setRelationships] = useState<MentorshipRelationship[]>([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState<MentorshipSession[]>([]);
  const [pastSessions, setPastSessions] = useState<MentorshipSession[]>([]);
  
  // Dialog states
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const [showResourcesDialog, setShowResourcesDialog] = useState(false);
  const [resources, setResources] = useState([]);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const loadMentorStatus = async () => {
      if (user) {
        try {
          const mentorProfile = await getMentorProfile();
          setIsMentor(!!mentorProfile);
        } catch (error) {
          console.error('Error checking mentor status:', error);
          setIsMentor(false);
        }
      }
    };

    loadMentorStatus();
  }, [user, getMentorProfile]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (user && isMentor !== null) {
        setIsLoading(true);
        try {
          const [relationshipsData, upcomingSessionsData, pastSessionsData] = await Promise.all([
            getMentorshipRelationships(),
            getUpcomingSessions(),
            getPastSessions(),
          ]);
          
          setRelationships(relationshipsData);
          setUpcomingSessions(upcomingSessionsData);
          setPastSessions(pastSessionsData);
          
          const [sentRequestsData, receivedRequestsData] = await Promise.all([
            getMentorshipRequests(false),
            isMentor ? getMentorshipRequests(true) : [],
          ]);
          
          setSentRequests(sentRequestsData);
          setReceivedRequests(receivedRequestsData);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [user, isMentor, getMentorshipRelationships, getUpcomingSessions, getPastSessions, getMentorshipRequests]);

  const handleScheduleSession = (relationshipId: string) => {
    setSelectedRelationshipId(relationshipId);
    setShowSessionDialog(true);
  };

  const handleOpenResources = async (relationshipId: string) => {
    setSelectedRelationshipId(relationshipId);
    setIsActionLoading(true);
    try {
      const resourcesData = await getRelationshipResources(relationshipId);
      setResources(resourcesData);
      setShowResourcesDialog(true);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSubmitSession = async (sessionData: Omit<MentorshipSession, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
    setIsActionLoading(true);
    try {
      await scheduleSession(sessionData);
      setShowSessionDialog(false);
      
      // Refresh upcoming sessions
      const updatedSessions = await getUpcomingSessions();
      setUpcomingSessions(updatedSessions);
    } catch (error) {
      console.error('Error scheduling session:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    setIsActionLoading(true);
    try {
      await updateSessionStatus(sessionId, 'completed');
      
      // Refresh sessions
      const [updatedUpcoming, updatedPast] = await Promise.all([
        getUpcomingSessions(),
        getPastSessions(),
      ]);
      
      setUpcomingSessions(updatedUpcoming);
      setPastSessions(updatedPast);
    } catch (error) {
      console.error('Error completing session:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    setIsActionLoading(true);
    try {
      await updateSessionStatus(sessionId, 'canceled');
      
      // Refresh sessions
      const [updatedUpcoming, updatedPast] = await Promise.all([
        getUpcomingSessions(),
        getPastSessions(),
      ]);
      
      setUpcomingSessions(updatedUpcoming);
      setPastSessions(updatedPast);
    } catch (error) {
      console.error('Error canceling session:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLeaveFeedback = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowFeedbackDialog(true);
  };

  const handleSubmitFeedback = async (feedbackData) => {
    setIsActionLoading(true);
    try {
      await submitSessionFeedback(feedbackData);
      setShowFeedbackDialog(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleShareResource = async (resourceData) => {
    setIsActionLoading(true);
    try {
      await shareResource(resourceData);
      
      // Refresh resources
      if (selectedRelationshipId) {
        const updatedResources = await getRelationshipResources(selectedRelationshipId);
        setResources(updatedResources);
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setIsActionLoading(true);
    try {
      await acceptMentorshipRequest(requestId);
      
      // Refresh requests and relationships
      const [updatedRequests, updatedRelationships] = await Promise.all([
        getMentorshipRequests(true),
        getMentorshipRelationships(),
      ]);
      
      setReceivedRequests(updatedRequests);
      setRelationships(updatedRelationships);
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setIsActionLoading(true);
    try {
      await rejectMentorshipRequest(requestId);
      
      // Refresh requests
      const updatedRequests = await getMentorshipRequests(true);
      setReceivedRequests(updatedRequests);
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    setIsActionLoading(true);
    try {
      await cancelMentorshipRequest(requestId);
      
      // Refresh requests
      const updatedRequests = await getMentorshipRequests(false);
      setSentRequests(updatedRequests);
    } catch (error) {
      console.error('Error canceling request:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading && isMentor === null) {
    return (
      <MainLayout>
        <div className="container max-w-7xl mx-auto py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <Spinner size="lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isMentor === false && !sentRequests.length) {
    return (
      <MainLayout>
        <div className="container max-w-7xl mx-auto py-8">
          <div className="text-center space-y-6 py-12">
            <h1 className="text-3xl font-bold">Welcome to the Mentorship Program</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with experienced professionals who can guide you in your career journey.
              Find a mentor who matches your interests and goals, or become a mentor to share your knowledge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button onClick={() => navigate('/mentorship/find-mentors')}>
                Find a Mentor
              </Button>
              <Button variant="outline" onClick={() => navigate('/mentorship/become-mentor')}>
                Become a Mentor
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mentorship Dashboard</h1>
            <p className="text-muted-foreground">
              {isMentor 
                ? 'Manage your mentorship relationships and sessions' 
                : 'Track your mentorship progress and upcoming sessions'}
            </p>
          </div>
          <div className="flex gap-4">
            {isMentor && (
              <Button variant="outline" onClick={() => navigate('/mentorship/mentees')}>
                Find Mentees
              </Button>
            )}
            {!isMentor && (
              <Button onClick={() => navigate('/mentorship/find-mentors')}>
                Find a Mentor
              </Button>
            )}
            {!isMentor && (
              <Button variant="outline" onClick={() => navigate('/mentorship/become-mentor')}>
                Become a Mentor
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="relationships">
          <TabsList className="mb-8">
            <TabsTrigger value="relationships">Mentorships</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="relationships">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Mentorship Relationships</h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : relationships.length === 0 ? (
                <div className="text-center py-8 bg-card rounded-lg border">
                  <p className="text-muted-foreground">You don't have any active mentorship relationships.</p>
                  {!isMentor && (
                    <Button className="mt-4" onClick={() => navigate('/mentorship/find-mentors')}>
                      Find a Mentor
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relationships.map((relationship) => (
                    <RelationshipCard
                      key={relationship.id}
                      id={relationship.id}
                      name={relationship.mentor_id === user?.id ? 'Mentee Name' : 'Mentor Name'} // Replace with actual names
                      avatarUrl=""
                      role={relationship.mentor_id === user?.id ? 'Mentee' : 'Mentor'}
                      startDate={relationship.start_date}
                      endDate={relationship.end_date}
                      isActive={relationship.is_active}
                      goals={relationship.goals}
                      isMentor={relationship.mentor_id === user?.id}
                      onScheduleSession={handleScheduleSession}
                      onOpenResources={handleOpenResources}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sessions">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <div className="text-center py-8 bg-card rounded-lg border">
                    <p className="text-muted-foreground">You don't have any upcoming sessions scheduled.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        id={session.id}
                        title="Mentorship Session" // Replace with relationship participants
                        scheduledAt={session.scheduled_at}
                        duration={session.duration}
                        location={session.location || 'Virtual'}
                        notes={session.notes}
                        status={session.status}
                        onComplete={handleCompleteSession}
                        onCancel={handleCancelSession}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Past Sessions</h2>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : pastSessions.length === 0 ? (
                  <div className="text-center py-8 bg-card rounded-lg border">
                    <p className="text-muted-foreground">You don't have any past sessions.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        id={session.id}
                        title="Mentorship Session" // Replace with relationship participants
                        scheduledAt={session.scheduled_at}
                        duration={session.duration}
                        location={session.location || 'Virtual'}
                        notes={session.notes}
                        status={session.status}
                        showFeedback={session.status === 'completed'}
                        onLeaveFeedback={handleLeaveFeedback}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="requests">
            <div className="space-y-8">
              {isMentor && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Mentorship Requests</h2>
                  <RequestsList
                    requests={receivedRequests}
                    isLoading={isLoading}
                    onAcceptRequest={handleAcceptRequest}
                    onRejectRequest={handleRejectRequest}
                    type="received"
                  />
                </div>
              )}
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Requests</h2>
                <RequestsList
                  requests={sentRequests}
                  isLoading={isLoading}
                  onCancelRequest={handleCancelRequest}
                  type="sent"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Schedule Session Dialog */}
        <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Mentorship Session</DialogTitle>
            </DialogHeader>
            {selectedRelationshipId && (
              <ScheduleSessionForm
                relationshipId={selectedRelationshipId}
                onSubmit={handleSubmitSession}
                isLoading={isActionLoading}
              />
            )}
          </DialogContent>
        </Dialog>
        
        {/* Resources Dialog */}
        {selectedRelationshipId && (
          <ResourcesDialog
            open={showResourcesDialog}
            onOpenChange={setShowResourcesDialog}
            resources={resources}
            relationshipId={selectedRelationshipId}
            onShareResource={handleShareResource}
            isLoading={isActionLoading}
          />
        )}
        
        {/* Feedback Dialog */}
        <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Session Feedback</DialogTitle>
            </DialogHeader>
            {selectedSessionId && (
              <FeedbackForm
                sessionId={selectedSessionId}
                onSubmit={handleSubmitFeedback}
                isLoading={isActionLoading}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

export default MentorshipDashboard;
