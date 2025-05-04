import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserRole } from '@/contexts/AuthContext';
import { Search, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserWithRoles {
  id: string;
  full_name: string;
  email: string;
  roles: UserRole[];
}

interface RolePermission {
  role: UserRole;
  permissions: string[];
}

const RoleManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssignRoleDialogOpen, setIsAssignRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const { user: currentAuthUser } = useAuth();
  
  // Predefined roles and their permissions
  const rolePermissions: RolePermission[] = [
    { 
      role: 'admin', 
      permissions: [
        'Access admin dashboard',
        'Manage all users',
        'Moderate all content',
        'Manage platform settings',
        'Access analytics',
        'Create announcements',
        'Manage roles',
        'View audit logs'
      ]
    },
    { 
      role: 'moderator', 
      permissions: [
        'Moderate content',
        'Approve/reject posts',
        'Manage comments',
        'Create announcements'
      ]
    },
    { 
      role: 'faculty', 
      permissions: [
        'Create verified content',
        'Auto-approved posts',
        'Create events',
        'View student profiles'
      ]
    },
    { 
      role: 'alumni', 
      permissions: [
        'Create content',
        'Apply for jobs',
        'Create job listings',
        'Access alumni network'
      ]
    },
    { 
      role: 'student', 
      permissions: [
        'Create content',
        'View job listings',
        'Apply for jobs',
        'Participate in events'
      ]
    }
  ];
  
  useEffect(() => {
    fetchUsersWithRoles();
  }, []);
  
  const fetchUsersWithRoles = async () => {
    setLoading(true);
    try {
      // Fetch all users with their profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email');
      
      if (profilesError) throw profilesError;
      
      // Fetch roles for each user
      if (profilesData) {
        const usersWithRoles = await Promise.all(profilesData.map(async (profile) => {
          // Convert numeric ID to string if needed
          const profileId = profile.id.toString();
          
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profileId);
            
          if (rolesError) throw rolesError;
          
          return {
            ...profile,
            id: profileId, // Ensure ID is a string
            roles: rolesData?.map(r => r.role as UserRole) || []
          };
        }));
        
        setUsers(usersWithRoles);
      }
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      toast.error('Failed to fetch users and roles');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const openAssignRoleDialog = (userId: string, username: string) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setIsAssignRoleDialogOpen(true);
  };
  
  const handleAssignRole = async (userId: string, role: UserRole) => {
    try {
      // Check if user already has this role
      const userRoles = users.find(u => u.id === userId)?.roles || [];
      
      if (userRoles.includes(role)) {
        // Remove role - convert role to string to match expected type
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role as any); // Type casting to work with Supabase's expected type
        
        if (error) throw error;
        
        toast.success(`Role '${role}' removed successfully`);
      } else {
        // Add role - convert role to string to match expected type
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: role as any }); // Type casting to work with Supabase's expected type
        
        if (error) throw error;
        
        toast.success(`Role '${role}' assigned successfully`);
      }
      
      // Refresh the users list
      fetchUsersWithRoles();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };
  
  const countUsersWithRole = (role: UserRole) => {
    return users.filter(user => user.roles.includes(role)).length;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading roles data...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Role Management</h1>
      
      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {rolePermissions.map((roleData) => (
          <Card key={roleData.role}>
            <CardHeader className="pb-2">
              <CardTitle className="capitalize">{roleData.role}</CardTitle>
              <CardDescription>
                {countUsersWithRole(roleData.role)} users with this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h4 className="text-sm font-medium mb-2">Permissions:</h4>
              <ul className="text-sm space-y-1">
                {roleData.permissions.map((permission, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* User Role Management */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">User Roles</h2>
        
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              value={searchQuery} 
              onChange={handleSearch} 
              className="pl-8"
            />
          </div>
          
          <Button variant="outline" onClick={() => setIsAssignRoleDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length > 0 ? user.roles.map((role, index) => (
                        <Badge 
                          key={index} 
                          variant={role === 'admin' ? 'destructive' : 'secondary'}
                          className="capitalize"
                        >
                          {role}
                        </Badge>
                      )) : (
                        <span className="text-muted-foreground text-sm">No roles assigned</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openAssignRoleDialog(user.id, user.full_name)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit Roles
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    No users found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Assign Role Dialog */}
      <Dialog open={isAssignRoleDialogOpen} onOpenChange={setIsAssignRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUserId ? `Manage Roles for ${selectedUsername}` : 'Assign Role to User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUserId 
                ? 'Click on a role to assign or remove it from this user.' 
                : 'Select a user and role to assign.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {!selectedUserId ? (
            <div className="space-y-4 py-2">
              <Input 
                placeholder="Search for users..." 
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                <Table>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow 
                        key={user.id} 
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => openAssignRoleDialog(user.id, user.full_name)}
                      >
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 gap-2">
                {rolePermissions.map((roleData) => {
                  const user = users.find(u => u.id === selectedUserId);
                  const hasRole = user?.roles.includes(roleData.role) || false;
                  
                  return (
                    <div 
                      key={roleData.role}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        hasRole ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                      }`}
                      onClick={() => handleAssignRole(selectedUserId, roleData.role)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{roleData.role}</span>
                        {hasRole && (
                          <Badge variant="outline" className="bg-primary/20">Assigned</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {roleData.permissions.slice(0, 2).join(', ')}
                        {roleData.permissions.length > 2 && '...'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedUserId(null);
              setIsAssignRoleDialogOpen(false);
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleManagement;
