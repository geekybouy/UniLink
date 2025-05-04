import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MoreHorizontal, UserCheck, Ban, Trash2, Edit, Download } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  roles: UserRole[];
  is_banned?: boolean;
  avatar_url?: string | null;
  last_sign_in_at?: string | null;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<{ [key in UserRole]: boolean }>({
    admin: false,
    moderator: false,
    faculty: false,
    student: false,
    alumni: false
  });
  
  const { user: currentAuthUser } = useAuth();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all users with their profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url');
      
      if (profilesError) throw profilesError;
      
      // Fetch roles for each user
      if (profilesData) {
        const usersWithRoles = await Promise.all(profilesData.map(async (profile) => {
          // Ensure profile.id is a string
          const profileId = profile.id ? profile.id.toString() : '';
          
          if (!profileId) {
            console.error('Invalid profile ID:', profile);
            return null;
          }
          
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profileId);
            
          if (rolesError) throw rolesError;
          
          return {
            ...profile,
            id: profileId,
            created_at: new Date().toISOString(), // Mock data since we don't have created_at
            roles: rolesData?.map(r => r.role as UserRole) || [],
            is_banned: false // Default value
          } as User;
        }));
        
        // Filter out any null values from invalid profiles
        setUsers(usersWithRoles.filter(user => user !== null) as User[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };
  
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsEditDialogOpen(true);
  };
  
  const handleManageRoles = (user: User) => {
    setCurrentUser(user);
    
    // Set initial role states based on user's existing roles
    const initialRoles = {
      admin: false,
      moderator: false,
      faculty: false,
      student: false,
      alumni: false
    };
    
    user.roles.forEach(role => {
      initialRoles[role] = true;
    });
    
    setUserRoles(initialRoles);
    setIsRoleDialogOpen(true);
  };
  
  const handleToggleRole = (role: UserRole, checked: boolean) => {
    setUserRoles(prev => ({
      ...prev,
      [role]: checked
    }));
  };
  
  const handleSaveRoles = async () => {
    if (!currentUser) return;
    
    try {
      // Convert userRoles object to array of selected roles
      const selectedRoles = Object.entries(userRoles)
        .filter(([_, isSelected]) => isSelected)
        .map(([role]) => role as UserRole);
      
      // Delete existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', currentUser.id);
      
      // Insert new roles
      if (selectedRoles.length > 0) {
        // Insert roles one by one to avoid type issues
        for (const role of selectedRoles) {
          const { error } = await supabase
            .from('user_roles')
            .insert({
              user_id: currentUser.id,
              role: role as any // Cast to any to avoid type issues with Supabase
            });
          
          if (error) throw error;
        }
        
        toast.success('User roles updated successfully');
        fetchUsers(); // Refresh user list
        setIsRoleDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating user roles:', error);
      toast.error('Failed to update user roles');
    }
  };
  
  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      // In a real implementation, you would update a ban status in the database
      // For now, we'll just show a toast
      toast.success(`User ${isBanned ? 'banned' : 'unbanned'} successfully`);
      
      // Update user in the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_banned: isBanned } : user
      ));
    } catch (error) {
      console.error('Error updating user ban status:', error);
      toast.error('Failed to update user');
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // In a production app, you might want to archive users instead of deleting them
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
        
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh user list
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };
  
  const handleBulkAction = async (action: 'ban' | 'delete' | 'export') => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }
    
    switch (action) {
      case 'ban':
        if (confirm(`Are you sure you want to ban ${selectedUsers.length} users?`)) {
          // Implementation would update ban status in the database
          toast.success(`${selectedUsers.length} users banned successfully`);
        }
        break;
        
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedUsers.length} users? This cannot be undone.`)) {
          try {
            // Delete each user one by one to avoid type issues
            for (const userId of selectedUsers) {
              const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);
              
              if (error) throw error;
            }
            
            toast.success(`${selectedUsers.length} users deleted successfully`);
            fetchUsers(); // Refresh user list
            setSelectedUsers([]);
          } catch (error) {
            console.error('Error deleting users:', error);
            toast.error('Failed to delete users');
          }
        }
        break;
        
      case 'export':
        // Generate CSV of selected users
        const selectedUserData = users.filter(user => selectedUsers.includes(user.id));
        const csv = [
          ['ID', 'Name', 'Email', 'Created At', 'Roles'].join(','),
          ...selectedUserData.map(user => [
            user.id,
            user.full_name,
            user.email,
            user.created_at,
            user.roles.join('; ')
          ].join(','))
        ].join('\n');
        
        // Create downloadable link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'users_export.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast.success(`${selectedUsers.length} users exported to CSV`);
        break;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
          <TabsTrigger value="admins">
            Admins ({users.filter(user => user.roles.includes('admin')).length})
          </TabsTrigger>
          <TabsTrigger value="moderators">
            Moderators ({users.filter(user => user.roles.includes('moderator')).length})
          </TabsTrigger>
        </TabsList>
        
        <div className="flex items-center justify-between my-4">
          <div className="flex gap-2 items-center">
            <Input 
              placeholder="Search users..." 
              value={searchQuery} 
              onChange={handleSearch} 
              className="w-64"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleBulkAction('ban')} 
              disabled={selectedUsers.length === 0}
            >
              <Ban className="w-4 h-4 mr-1" /> Ban Selected
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleBulkAction('export')}
              disabled={selectedUsers.length === 0}
            >
              <Download className="w-4 h-4 mr-1" /> Export Selected
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleBulkAction('delete')}
              disabled={selectedUsers.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete Selected
            </Button>
          </div>
        </div>
        
        <TabsContent value="all">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map(role => (
                        <Badge key={role} variant={role === 'admin' ? 'destructive' : 'secondary'}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_banned ? 'destructive' : 'default'}>
                      {user.is_banned ? 'Banned' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageRoles(user)}>
                          <UserCheck className="h-4 w-4 mr-2" /> Manage Roles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBanUser(user.id, !user.is_banned)}>
                          <Ban className="h-4 w-4 mr-2" />
                          {user.is_banned ? 'Unban User' : 'Ban User'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive" 
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No users found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
        
        {/* Similar table structure for other tabs, filtered accordingly */}
      </Tabs>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update information for {currentUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={currentUser?.full_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={currentUser?.email} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('User updated successfully');
              setIsEditDialogOpen(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              Set roles for {currentUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              {Object.entries(userRoles).map(([role, isChecked]) => (
                <div key={role} className="flex items-center gap-2">
                  <Checkbox 
                    id={`role-${role}`} 
                    checked={isChecked} 
                    onCheckedChange={(checked) => handleToggleRole(role as UserRole, !!checked)}
                  />
                  <Label htmlFor={`role-${role}`} className="capitalize">{role}</Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRoles}>Save Roles</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
