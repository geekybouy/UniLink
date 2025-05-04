
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, UserRole[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const usersPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('*')
        .range((currentPage - 1) * usersPerPage, currentPage * usersPerPage - 1);

      if (error) throw error;

      setUsers(usersData || []);

      // Fetch roles for each user
      if (usersData && usersData.length > 0) {
        const userIds = usersData.map(user => user.user_id);
        await fetchRolesForUsers(userIds);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRolesForUsers = async (userIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);

      if (error) throw error;

      const rolesMap: Record<string, UserRole[]> = {};
      
      if (data) {
        data.forEach(role => {
          if (!rolesMap[role.user_id]) {
            rolesMap[role.user_id] = [];
          }
          rolesMap[role.user_id].push(role.role as UserRole);
        });
      }

      setUserRoles(rolesMap);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole, action: 'add' | 'remove') => {
    if (user?.id === userId && role === 'admin' && action === 'remove') {
      toast({
        title: 'Forbidden',
        description: 'You cannot remove your own admin role',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (action === 'add') {
        // Use a raw SQL query via rpc to add role
        const { error } = await supabase.rpc('add_user_role', { 
          user_id_param: userId, 
          role_param: role 
        });
          
        if (error) throw error;
      } else {
        // Use a raw SQL query via rpc to delete role
        const { error } = await supabase.rpc('remove_user_role', { 
          user_id_param: userId, 
          role_param: role 
        });
          
        if (error) throw error;
      }

      // Refresh roles for this user
      await fetchRolesForUsers([userId]);
      
      toast({
        title: 'Success',
        description: `Role ${action === 'add' ? 'assigned' : 'removed'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const hasRole = (userId: string, role: UserRole) => {
    return userRoles[userId]?.includes(role) || false;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
            <p className="mt-4">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {users.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                users.map((user) => (
                  <Card key={user.user_id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="User avatar" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xl font-semibold">{user.full_name?.[0] || '?'}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex flex-wrap gap-2">
                          {['admin', 'moderator', 'student', 'alumni', 'faculty'].map((role) => {
                            const userHasRole = hasRole(user.user_id, role as UserRole);
                            return (
                              <Button
                                key={role}
                                variant={userHasRole ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleRoleChange(
                                  user.user_id, 
                                  role as UserRole, 
                                  userHasRole ? 'remove' : 'add'
                                )}
                                disabled={isSubmitting}
                              >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                {userHasRole ? ' ✓' : ''}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="py-2">Page {currentPage}</span>
              <Button 
                variant="outline" 
                onClick={handleNextPage}
                disabled={users.length < usersPerPage}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
