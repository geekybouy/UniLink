
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';
import AdminLayout from '@/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  roles: UserRole[];
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch users from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;
      
      // Combine the data
      const usersWithRoles = profiles.map((profile: any) => {
        const roles = userRoles
          .filter((r: any) => r.user_id === profile.user_id)
          .map((r: any) => r.role);
          
        return {
          id: profile.user_id,
          email: profile.email || 'N/A',
          full_name: profile.full_name || 'Unknown',
          created_at: profile.created_at,
          roles: roles as UserRole[]
        };
      });
      
      setUsers(usersWithRoles);
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

  const addRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase.rpc('add_user_role', {
        user_id_param: userId,
        role_param: role
      });
      
      if (error) throw error;
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId
            ? { ...user, roles: user.roles.includes(role) ? user.roles : [...user.roles, role] }
            : user
        )
      );
      
      toast({
        title: 'Success',
        description: `${role} role added successfully`,
      });
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: 'Error',
        description: 'Failed to add role',
        variant: 'destructive',
      });
    }
  };

  const removeRole = async (userId: string, role: UserRole) => {
    try {
      const { error } = await supabase.rpc('remove_user_role', {
        user_id_param: userId,
        role_param: role
      });
      
      if (error) throw error;
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId
            ? { ...user, roles: user.roles.filter(r => r !== role) }
            : user
        )
      );
      
      toast({
        title: 'Success',
        description: `${role} role removed successfully`,
      });
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove role',
        variant: 'destructive',
      });
    }
  };

  const content = (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4">Loading users...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <Badge key={role} variant="outline" className="capitalize">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2 flex-wrap">
                      <select
                        className="px-2 py-1 border rounded text-sm"
                        onChange={(e) => {
                          if (e.target.value) {
                            addRole(user.id, e.target.value as UserRole);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>Add role...</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="student">Student</option>
                        <option value="alumni">Alumni</option>
                        <option value="faculty">Faculty</option>
                      </select>
                      
                      {user.roles.length > 0 && (
                        <select
                          className="px-2 py-1 border rounded text-sm"
                          onChange={(e) => {
                            if (e.target.value) {
                              removeRole(user.id, e.target.value as UserRole);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Remove role...</option>
                          {user.roles.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
};

export default UserManagement;
