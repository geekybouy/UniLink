import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, Clock, MessageSquare, ExternalLink } from 'lucide-react';
import { useConnections } from '@/contexts/ConnectionContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import ConnectionButton from '@/components/connection/ConnectionButton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MyNetwork = () => {
  const { 
    connections, 
    connectionUsers, 
    pendingRequests, 
    loading, 
    refreshConnections
  } = useConnections();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!user) {
    return null;
  }
  
  const acceptedConnections = connections.filter(conn => conn.status === 'accepted');
  
  // Filter connections by search term
  const filteredConnections = acceptedConnections.filter(conn => {
    const otherUserId = conn.sender_id === user.id ? conn.receiver_id : conn.sender_id;
    const otherUser = connectionUsers[otherUserId];
    
    if (!otherUser) return false;
    
    return (
      otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (otherUser.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
  });
  
  // Organized my connections
  const renderedConnections = filteredConnections.map(conn => {
    const otherUserId = conn.sender_id === user.id ? conn.receiver_id : conn.sender_id;
    const otherUser = connectionUsers[otherUserId];
    
    if (!otherUser) return null;
    
    return (
      <Card key={conn.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser.avatarUrl || ''} />
              <AvatarFallback>
                {otherUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-medium">{otherUser.fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {otherUser.job_title || 'Student'} 
                {otherUser.current_company && ` at ${otherUser.current_company}`}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info("Messaging feature coming soon!");
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/profile/${otherUserId}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  });
  
  // Pending requests received
  const pendingConnectionRequests = pendingRequests.map(conn => {
    const fromUser = connectionUsers[conn.sender_id];
    
    if (!fromUser) return null;
    
    return (
      <Card key={conn.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={fromUser.avatarUrl || ''} />
              <AvatarFallback>
                {fromUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-medium">{fromUser.fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {fromUser.job_title || 'Student'} 
                {fromUser.current_company && ` at ${fromUser.current_company}`}
              </p>
            </div>
            
            <ConnectionButton userId={fromUser.user_id} />
          </div>
        </CardContent>
      </Card>
    );
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 font-sans bg-background">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">My Network</h1>
            <p className="text-muted-foreground">
              Manage your professional connections
            </p>
          </div>
          <Button onClick={() => navigate('/alumni-directory')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Find Alumni
          </Button>
        </div>
        
        <Tabs defaultValue="connections">
          <TabsList className="mb-6">
            <TabsTrigger value="connections" className="flex gap-2">
              <Users className="h-4 w-4" />
              Connections
              <Badge variant="secondary">{acceptedConnections.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex gap-2">
              <Clock className="h-4 w-4" />
              Pending
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="connections">
            <div className="mb-4">
              <Input
                type="search"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading your connections...</p>
            ) : filteredConnections.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No connections yet</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 
                    'No connections match your search' : 
                    'Start building your network by connecting with alumni'}
                </p>
                {!searchTerm && (
                  <Button asChild>
                    <Link to="/alumni-directory">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find Alumni
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-300px)]">
                {renderedConnections}
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="pending">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading pending requests...</p>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any pending connection requests at the moment
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-300px)]">
                {pendingConnectionRequests}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default MyNetwork;
