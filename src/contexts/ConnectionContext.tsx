
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Connection {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

export interface ConnectionUser {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  username?: string;
  job_title?: string | null;
  current_company?: string | null;
  user_id: string;
}

interface ConnectionContextType {
  // User connections
  connections: Connection[];
  connectionUsers: Record<string, ConnectionUser>;
  pendingRequests: Connection[];
  
  // Connection management functions
  sendConnectionRequest: (receiverId: string) => Promise<void>;
  acceptConnectionRequest: (connectionId: string) => Promise<void>;
  rejectConnectionRequest: (connectionId: string) => Promise<void>;
  removeConnection: (connectionId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  
  // Status check helpers
  getConnectionStatus: (userId: string) => ConnectionStatus | null;
  isConnected: (userId: string) => boolean;
  isPending: (userId: string) => boolean;
  isBlocked: (userId: string) => boolean;
  
  // Loading states
  loading: boolean;
  refreshing: boolean;
  
  // Refresh connections
  refreshConnections: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionUsers, setConnectionUsers] = useState<Record<string, ConnectionUser>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter for pending connection requests
  const pendingRequests = connections.filter(
    conn => conn.receiver_id === user?.id && conn.status === 'pending'
  );

  // Initial load of user connections
  useEffect(() => {
    if (user) {
      fetchConnections();
      
      // Set up realtime subscription for connections
      const channel = supabase
        .channel('connections-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'connections', filter: `sender_id=eq.${user.id}` },
          () => { fetchConnections(); }
        )
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'connections', filter: `receiver_id=eq.${user.id}` },
          () => { fetchConnections(); }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Fetch all connections related to the current user
  const fetchConnections = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get all connections where the user is either sender or receiver
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      
      if (connectionsError) throw connectionsError;
      
      // Cast the data to ensure it matches the Connection type
      const typedConnections: Connection[] = connectionsData?.map(conn => ({
        ...conn,
        status: conn.status as ConnectionStatus
      })) || [];
      
      setConnections(typedConnections);
      
      // Get unique user IDs from connections
      const userIds = new Set<string>();
      typedConnections.forEach(conn => {
        const otherId = conn.sender_id === user.id ? conn.receiver_id : conn.sender_id;
        userIds.add(otherId);
      });
      
      // Fetch user profiles for those IDs
      if (userIds.size > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, avatar_url, username, job_title, current_company')
          .in('user_id', Array.from(userIds));
        
        if (profilesError) throw profilesError;
        
        const usersMap: Record<string, ConnectionUser> = {};
        profilesData?.forEach(profile => {
          usersMap[profile.user_id] = {
            id: profile.id.toString(),
            user_id: profile.user_id,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            username: profile.username,
            job_title: profile.job_title,
            current_company: profile.current_company
          };
        });
        
        setConnectionUsers(usersMap);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  // Refresh connections data
  const refreshConnections = async () => {
    setRefreshing(true);
    await fetchConnections();
    setRefreshing(false);
  };

  // Send a new connection request
  const sendConnectionRequest = async (receiverId: string) => {
    if (!user) return;
    
    try {
      // Check if a connection already exists
      const existingConnection = connections.find(
        conn => 
          (conn.sender_id === user.id && conn.receiver_id === receiverId) || 
          (conn.sender_id === receiverId && conn.receiver_id === user.id)
      );
      
      if (existingConnection) {
        if (existingConnection.status === 'pending') {
          toast.info('Connection request already sent');
        } else if (existingConnection.status === 'accepted') {
          toast.info('You are already connected with this user');
        } else if (existingConnection.status === 'blocked') {
          toast.error('Cannot send request to this user');
        }
        return;
      }
      
      // Create a new connection request
      const { error } = await supabase
        .from('connections')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });
      
      if (error) throw error;
      
      // Create notification for the receiver
      await supabase
        .from('notifications')
        .insert({
          user_id: receiverId,
          from_user_id: user.id,
          type: 'connection_request',
          content: 'sent you a connection request',
          metadata: { connection_type: 'new_request' }
        });
      
      toast.success('Connection request sent');
      await fetchConnections();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };

  // Accept a connection request
  const acceptConnectionRequest = async (connectionId: string) => {
    if (!user) return;
    
    try {
      const connection = connections.find(conn => conn.id === connectionId);
      if (!connection || connection.receiver_id !== user.id) {
        toast.error('Cannot accept this connection request');
        return;
      }
      
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);
      
      if (error) throw error;
      
      // Create notification for the sender
      await supabase
        .from('notifications')
        .insert({
          user_id: connection.sender_id,
          from_user_id: user.id,
          type: 'connection_accepted',
          content: 'accepted your connection request',
          metadata: { connection_id: connectionId }
        });
      
      toast.success('Connection request accepted');
      await fetchConnections();
    } catch (error) {
      console.error('Error accepting connection request:', error);
      toast.error('Failed to accept connection request');
    }
  };

  // Reject a connection request
  const rejectConnectionRequest = async (connectionId: string) => {
    if (!user) return;
    
    try {
      const connection = connections.find(conn => conn.id === connectionId);
      if (!connection || connection.receiver_id !== user.id) {
        toast.error('Cannot reject this connection request');
        return;
      }
      
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);
      
      if (error) throw error;
      
      toast.success('Connection request rejected');
      await fetchConnections();
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      toast.error('Failed to reject connection request');
    }
  };

  // Remove an existing connection
  const removeConnection = async (connectionId: string) => {
    if (!user) return;
    
    try {
      const connection = connections.find(conn => conn.id === connectionId);
      if (!connection) {
        toast.error('Connection not found');
        return;
      }
      
      // Check if user is part of this connection
      if (connection.sender_id !== user.id && connection.receiver_id !== user.id) {
        toast.error('Cannot remove this connection');
        return;
      }
      
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);
      
      if (error) throw error;
      
      toast.success('Connection removed');
      await fetchConnections();
    } catch (error) {
      console.error('Error removing connection:', error);
      toast.error('Failed to remove connection');
    }
  };

  // Block a user
  const blockUser = async (userId: string) => {
    if (!user) return;
    
    try {
      // Find existing connection
      const existingConnection = connections.find(
        conn => 
          (conn.sender_id === user.id && conn.receiver_id === userId) || 
          (conn.sender_id === userId && conn.receiver_id === user.id)
      );
      
      if (existingConnection) {
        // Update existing connection to blocked status
        const { error } = await supabase
          .from('connections')
          .update({ 
            status: 'blocked',
            // Set the current user as sender if they weren't already
            ...(existingConnection.sender_id !== user.id ? {
              sender_id: user.id,
              receiver_id: userId
            } : {})
          })
          .eq('id', existingConnection.id);
          
        if (error) throw error;
      } else {
        // Create new blocked connection
        const { error } = await supabase
          .from('connections')
          .insert({
            sender_id: user.id,
            receiver_id: userId,
            status: 'blocked'
          });
          
        if (error) throw error;
      }
      
      toast.success('User blocked');
      await fetchConnections();
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  // Helper functions to check connection status
  const getConnectionStatus = (userId: string): ConnectionStatus | null => {
    const connection = connections.find(
      conn => 
        (conn.sender_id === user?.id && conn.receiver_id === userId) || 
        (conn.sender_id === userId && conn.receiver_id === user?.id)
    );
    
    return connection ? connection.status : null;
  };
  
  const isConnected = (userId: string): boolean => {
    return getConnectionStatus(userId) === 'accepted';
  };
  
  const isPending = (userId: string): boolean => {
    const connection = connections.find(
      conn => 
        (conn.sender_id === user?.id && conn.receiver_id === userId) || 
        (conn.sender_id === userId && conn.receiver_id === user?.id)
    );
    
    return connection ? 
      (connection.status === 'pending' && connection.sender_id === user?.id) : 
      false;
  };
  
  const isBlocked = (userId: string): boolean => {
    return getConnectionStatus(userId) === 'blocked';
  };

  const value = {
    connections,
    connectionUsers,
    pendingRequests,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    removeConnection,
    blockUser,
    getConnectionStatus,
    isConnected,
    isPending,
    isBlocked,
    loading,
    refreshing,
    refreshConnections
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export const useConnections = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnections must be used within a ConnectionProvider');
  }
  return context;
};
